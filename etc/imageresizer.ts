import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

async function resizeImages() {
  const sourceDir = path.join(process.cwd(), '..', 'client', 'public', 'kols', 'images');
  
  try {
    // 디렉토리 내의 모든 파일 읽기
    const files = await fs.readdir(sourceDir);
    
    console.log(`Found ${files.length} images to process`);

    // 각 이미지 파일 처리
    for (const file of files) {
      if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(sourceDir, file);

      try {
        await sharp(sourcePath)
          .resize(64, 64, {
            fit: 'cover',
            position: 'center'
          })
          .toFile(targetPath + '.tmp');

        // 임시 파일을 원본 파일로 이동
        await fs.unlink(sourcePath);
        await fs.rename(targetPath + '.tmp', targetPath);

        console.log(`✅ Resized: ${file}`);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
      }
    }

    console.log('Image resizing completed!');
  } catch (error) {
    console.error('Failed to process images:', error);
  }
}

// 스크립트 실행
resizeImages(); 