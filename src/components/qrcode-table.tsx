import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { getTableLink } from '@/lib/utils';
export default function QrCodeTable({
  tableNumber,
  token,
  width = 250,
  tableName,
}: {
  tableNumber: number;
  token: string;
  width?: number;
  tableName: string;
}) {
  /**
   * Hiện tại thư viện QRCode đang vẽ lên thẻ canvas
   * Bây giờ : Chúng ta sẽ vẽ 1 cái thẻ canvas ảo để thư viện nó vẽ QR lên theo canvas đó
   * VÀ Chúng ta sẽ edit lên Canvas thật
   * Cuối cùng chúng ta đưa thẻ Canvas ảo chứa QR code vào thể canvas thật
   */

  const refCanvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = refCanvas.current!;
    canvas.height = width + 70;
    canvas.width = width;

    const canvasContext = canvas.getContext('2d')!;
    canvasContext.fillStyle = 'white';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    canvasContext.font = '15px Arial';
    canvasContext.fillStyle = 'black';
    canvasContext.textAlign = 'center';
    canvasContext.fillText(`${tableName}`, canvas.width / 2, canvas.width + 15);
    canvasContext.fillText(
      `Quét QR để gọi món`,
      canvas.width / 2,
      canvas.width + 40,
    );

    const canvasVirtual = document.createElement('canvas');

    QRCode.toCanvas(
      canvasVirtual,
      getTableLink({
        tableNumber,
        token,
      }),

      function (error) {
        if (error) console.error(error);
        canvasContext.drawImage(canvasVirtual, 0, 0, width, width);
      },
    );
  });
  return <canvas ref={refCanvas} className="mx-auto" width={width} />;
}
