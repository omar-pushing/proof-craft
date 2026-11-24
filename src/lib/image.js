/** Crops an image file to a centred square and returns a small JPEG data URL, so photos stay light in storage and in exports. */
export function squarePhoto(file, size = 240) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 8e6) return reject(new Error('type'));
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { const s = Math.min(img.width, img.height), c = Object.assign(document.createElement('canvas'), { width: size, height: size }); c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size); URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', 0.85)); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('read')); }; img.src = url;
  });
}
