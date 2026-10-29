const { supabase, dbAll } = require('../db');
const sharp = require('sharp');

async function compressBase64(dataUri, maxDimension = 1200, quality = 80) {
  if (!dataUri || typeof dataUri !== 'string') return dataUri;
  if (!dataUri.startsWith('data:image/')) return dataUri;

  const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!matches) return dataUri;

  const mime = matches[1];
  const base64Data = matches[2];
  const inputBuffer = Buffer.from(base64Data, 'base64');

  // If buffer is already under 70KB, skip compression
  if (inputBuffer.length < 70 * 1024) {
    console.log(`  -> Already compact (${Math.round(inputBuffer.length / 1024)} KB), skipping.`);
    return dataUri;
  }

  try {
    const outputBuffer = await sharp(inputBuffer)
      .rotate() // auto-orient based on EXIF
      .resize(maxDimension, maxDimension, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality })
      .toBuffer();

    const newUri = `data:image/webp;base64,${outputBuffer.toString('base64')}`;
    const beforeKb = Math.round(inputBuffer.length / 1024);
    const afterKb = Math.round(outputBuffer.length / 1024);
    const reduction = Math.round((1 - outputBuffer.length / inputBuffer.length) * 100);
    console.log(`  ✓ Compressed from ${beforeKb} KB to ${afterKb} KB (-${reduction}%)`);
    return newUri;
  } catch (err) {
    console.warn('  ⚠️ Sharp compression to WebP failed, trying JPEG:', err.message);
    try {
      const outputBuffer = await sharp(inputBuffer)
        .rotate()
        .resize(maxDimension, maxDimension, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
      const newUri = `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;
      return newUri;
    } catch (fallbackErr) {
      console.error('  ❌ Fallback compression also failed:', fallbackErr.message);
      return dataUri;
    }
  }
}

async function run() {
  console.log('--- Starting Database Image Compression ---');

  // 1. GALLERY IMAGES
  console.log('\n[1/4] Processing gallery_images...');
  const { data: gallery, error: galErr } = await supabase.from('gallery_images').select('id, title, image');
  if (galErr) throw galErr;
  console.log(`Found ${gallery.length} gallery items.`);
  for (const item of gallery) {
    if (!item.image) continue;
    console.log(`Inspecting Gallery #${item.id} (${item.title || 'Untitled'})... Length: ${item.image.length}`);
    const compressed = await compressBase64(item.image, 1400, 80);
    if (compressed !== item.image) {
      const { error } = await supabase.from('gallery_images').update({ image: compressed }).eq('id', item.id);
      if (error) console.error(`  Error updating Gallery #${item.id}:`, error);
      else console.log(`  ✓ Updated Gallery #${item.id} in Supabase!`);
    }
  }

  // 2. EVENTS
  console.log('\n[2/4] Processing events...');
  const { data: events, error: evErr } = await supabase.from('events').select('id, title, image, slideshow_images');
  if (evErr) throw evErr;
  console.log(`Found ${events.length} events.`);
  for (const ev of events) {
    console.log(`Inspecting Event #${ev.id} (${ev.title || 'Untitled'})...`);
    let needsUpdate = false;
    const updates = {};

    if (ev.image) {
      console.log(` Event #${ev.id} main image length: ${ev.image.length}`);
      const comp = await compressBase64(ev.image, 1400, 80);
      if (comp !== ev.image) {
        updates.image = comp;
        needsUpdate = true;
      }
    }

    if (ev.slideshow_images) {
      let slides = [];
      try {
        slides = typeof ev.slideshow_images === 'string' ? JSON.parse(ev.slideshow_images) : ev.slideshow_images;
      } catch (e) {}
      if (Array.isArray(slides) && slides.length > 0) {
        console.log(` Event #${ev.id} has ${slides.length} slideshow images...`);
        let slideChanged = false;
        const updatedSlides = [];
        for (const slide of slides) {
          const compSlide = await compressBase64(slide, 1200, 78);
          if (compSlide !== slide) slideChanged = true;
          updatedSlides.push(compSlide);
        }
        if (slideChanged) {
          updates.slideshow_images = JSON.stringify(updatedSlides);
          needsUpdate = true;
        }
      }
    }

    if (needsUpdate) {
      const { error } = await supabase.from('events').update(updates).eq('id', ev.id);
      if (error) console.error(`  Error updating Event #${ev.id}:`, error);
      else console.log(`  ✓ Updated Event #${ev.id} in Supabase!`);
    }
  }

  // 3. MOMENTS IMAGES
  console.log('\n[3/4] Processing moments_images...');
  const { data: moments, error: momErr } = await supabase.from('moments_images').select('id, title, image');
  if (!momErr && Array.isArray(moments)) {
    console.log(`Found ${moments.length} moments.`);
    for (const m of moments) {
      if (!m.image) continue;
      console.log(`Inspecting Moment #${m.id} (${m.title || 'Untitled'})...`);
      const comp = await compressBase64(m.image, 1400, 80);
      if (comp !== m.image) {
        const { error } = await supabase.from('moments_images').update({ image: comp }).eq('id', m.id);
        if (error) console.error(`  Error updating Moment #${m.id}:`, error);
        else console.log(`  ✓ Updated Moment #${m.id} in Supabase!`);
      }
    }
  }

  // 4. TEAM MEMBERS
  console.log('\n[4/4] Processing team_members...');
  const { data: team, error: teamErr } = await supabase.from('team_members').select('id, name, image');
  if (!teamErr && Array.isArray(team)) {
    console.log(`Found ${team.length} team members.`);
    for (const member of team) {
      if (!member.image || !member.image.startsWith('data:image/')) continue;
      console.log(`Inspecting Team #${member.id} (${member.name})...`);
      const comp = await compressBase64(member.image, 800, 80);
      if (comp !== member.image) {
        const { error } = await supabase.from('team_members').update({ image: comp }).eq('id', member.id);
        if (error) console.error(`  Error updating Team #${member.id}:`, error);
        else console.log(`  ✓ Updated Team #${member.id} in Supabase!`);
      }
    }
  }

  console.log('\n✨ Database image compression completed successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error during compression:', err);
  process.exit(1);
});
