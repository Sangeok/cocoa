import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

interface UpbitFee {
  currency: string;
  network: string;
}

interface BinanceFee {
  symbol: string;
  withdrawalFee: string;
  network?: string;
}

async function downloadImage(url: string, filepath: string) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.writeFile(filepath, response.data);
    console.log(`✅ Downloaded: ${url}`);
  } catch (error) {
    console.log(`❌ Failed to download: ${url}`);
  }
}

async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function loadFeeFile(filePath: string): Promise<string[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  if (data.currencies) {
    // Upbit fees
    return data.currencies.map((fee: UpbitFee) => fee.currency);
  } else {
    // Binance fees
    return data.map((fee: BinanceFee) => fee.symbol);
  }
}

async function main() {
  // 저장 디렉토리 생성
  const saveDir = path.join(process.cwd(), '..', 'client', 'public', 'coins');
  await ensureDirectoryExists(saveDir);

  // 수수료 파일 로드
  const upbitFees = await loadFeeFile(path.join(process.cwd(), '..', 'server', 'config', 'upbit-fees.json'));
  const binanceFees = await loadFeeFile(path.join(process.cwd(), '..', 'server', 'config', 'binance-fees.json'));

  // 중복 제거를 위한 Set (undefined, null, KRW 제외)
  const coins = new Set([
    ...upbitFees,
    ...binanceFees
  ].filter(symbol => symbol && symbol !== 'KRW'));

  console.log(`Found ${coins.size} unique coins`);

  // 각 코인에 대해 이미지 다운로드
  for (const coin of coins) {
    try {
      const imageUrl = `https://static.upbit.com/logos/${coin}.png`;
      const savePath = path.join(saveDir, `${coin.toLowerCase()}.png`);

      await downloadImage(imageUrl, savePath);
      // 요청 간 간격 추가
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing coin ${coin}:`, error);
      continue;
    }
  }

  console.log('Download process completed!');
}

main().catch(console.error); 