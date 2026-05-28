import * as THREE from 'three';

// Procedural texture generation for when no image textures are available
// These create realistic-looking materials purely in code

const textureCache = new Map<string, THREE.Texture>();

function createCanvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Load a custom texture from a data URL or image URL.
 * Returns a Three.js texture with repeat wrapping.
 */
export function loadCustomTexture(id: string, imageUrl: string, tileSize: number = 1): THREE.Texture {
  const key = `custom-${id}-${tileSize}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const loader = new THREE.TextureLoader();
  const texture = loader.load(imageUrl);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1 / tileSize, 1 / tileSize);
  textureCache.set(key, texture);
  return texture;
}

export function getTexture(name: string, tileSize: number = 1): THREE.Texture {
  const key = `${name}-${tileSize}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  let texture: THREE.Texture;

  // Check if it's a custom texture (starts with "custom-")
  if (name.startsWith('custom-')) {
    // Custom textures are loaded via loadCustomTexture separately
    // Return a default if not found in cache
    return getTexture('plaster-white', tileSize);
  }

  switch (name) {
    case 'plaster-white':
      texture = createPlasterTexture('#f5f5f0', '#ebe8e0');
      break;
    case 'plaster-grey':
      texture = createPlasterTexture('#d0d0d0', '#c0c0c0');
      break;
    case 'brick-red':
      texture = createBrickTexture('#8B4513', '#A0522D', '#d4c4a8');
      break;
    case 'brick-white':
      texture = createBrickTexture('#e8e0d8', '#f0ece8', '#c8c0b8');
      break;
    case 'concrete':
      texture = createConcreteTexture();
      break;
    case 'wood-panel':
      texture = createWoodTexture('#8B6914', '#6B4914');
      break;
    case 'hardwood-oak':
      texture = createHardwoodTexture('#C4A35A', '#A08040', '#8B6914');
      break;
    case 'hardwood-walnut':
      texture = createHardwoodTexture('#5C4033', '#4A3728', '#3E2C22');
      break;
    case 'marble-white':
      texture = createMarbleTexture('#f0ece8', '#d8d0c8');
      break;
    case 'tile-grey':
      texture = createTileTexture('#a0a0a0', '#909090', '#707070');
      break;
    case 'carpet-beige':
      texture = createCarpetTexture('#C8B896', '#B8A886');
      break;
    default:
      texture = createPlasterTexture('#f5f5f0', '#ebe8e0');
  }

  texture.repeat.set(1 / tileSize, 1 / tileSize);
  textureCache.set(key, texture);
  return texture;
}

function createPlasterTexture(color1: string, color2: string): THREE.Texture {
  return createCanvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, 512, 512);
    // Add subtle noise
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 2 + 0.5;
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '0,0,0' : '255,255,255'}, ${Math.random() * 0.06})`;
      ctx.fillRect(x, y, size, size);
    }
    // Subtle variation
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 300);
    gradient.addColorStop(0, 'rgba(255,255,255,0.03)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.03)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
  });
}

function createBrickTexture(color1: string, color2: string, mortarColor: string): THREE.Texture {
  return createCanvasTexture(512, 512, (ctx) => {
    const brickW = 64;
    const brickH = 28;
    const mortarW = 4;

    ctx.fillStyle = mortarColor;
    ctx.fillRect(0, 0, 512, 512);

    for (let row = 0; row < Math.ceil(512 / (brickH + mortarW)); row++) {
      const offset = row % 2 === 0 ? 0 : brickW / 2;
      for (let col = -1; col < Math.ceil(512 / (brickW + mortarW)) + 1; col++) {
        const x = col * (brickW + mortarW) + offset;
        const y = row * (brickH + mortarW);

        // Random color variation per brick
        const r = Math.random();
        ctx.fillStyle = r > 0.3 ? color1 : color2;
        ctx.fillRect(x + mortarW / 2, y + mortarW / 2, brickW, brickH);

        // Subtle shading on brick
        const grad = ctx.createLinearGradient(x, y, x, y + brickH);
        grad.addColorStop(0, 'rgba(255,255,255,0.08)');
        grad.addColorStop(1, 'rgba(0,0,0,0.08)');
        ctx.fillStyle = grad;
        ctx.fillRect(x + mortarW / 2, y + mortarW / 2, brickW, brickH);
      }
    }
  });
}

function createConcreteTexture(): THREE.Texture {
  return createCanvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const shade = Math.floor(Math.random() * 40 + 140);
      ctx.fillStyle = `rgba(${shade},${shade},${shade}, 0.3)`;
      ctx.fillRect(x, y, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }
  });
}

function createWoodTexture(color1: string, color2: string): THREE.Texture {
  return createCanvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, 512, 512);
    // Wood grain lines
    for (let y = 0; y < 512; y += 2) {
      const wobble = Math.sin(y * 0.02) * 10 + Math.sin(y * 0.005) * 20;
      ctx.strokeStyle = `rgba(0,0,0, ${0.03 + Math.random() * 0.04})`;
      ctx.lineWidth = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.moveTo(wobble, y);
      ctx.lineTo(512 + wobble, y);
      ctx.stroke();
    }
    // Knots
    for (let i = 0; i < 3; i++) {
      const kx = Math.random() * 512;
      const ky = Math.random() * 512;
      const kr = Math.random() * 15 + 8;
      const grad = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr);
      grad.addColorStop(0, color2);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(kx, ky, kr, kr * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function createHardwoodTexture(color1: string, color2: string, color3: string): THREE.Texture {
  return createCanvasTexture(512, 512, (ctx) => {
    const plankWidth = 80;
    const plankGap = 2;

    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(0, 0, 512, 512);

    for (let px = 0; px < 512; px += plankWidth + plankGap) {
      const colors = [color1, color2, color3];
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillStyle = baseColor;
      ctx.fillRect(px, 0, plankWidth, 512);

      // Grain
      for (let y = 0; y < 512; y += 1) {
        const wobble = Math.sin(y * 0.015 + px * 0.1) * 5;
        ctx.strokeStyle = `rgba(0,0,0, ${0.02 + Math.random() * 0.03})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + wobble, y);
        ctx.lineTo(px + plankWidth + wobble, y);
        ctx.stroke();
      }

      // Plank variation
      const grad = ctx.createLinearGradient(px, 0, px + plankWidth, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0.04)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.02)');
      grad.addColorStop(1, 'rgba(0,0,0,0.04)');
      ctx.fillStyle = grad;
      ctx.fillRect(px, 0, plankWidth, 512);
    }
  });
}

function createMarbleTexture(color1: string, color2: string): THREE.Texture {
  return createCanvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, 512, 512);

    // Marble veins
    for (let v = 0; v < 8; v++) {
      ctx.strokeStyle = `rgba(180,170,160, ${0.1 + Math.random() * 0.15})`;
      ctx.lineWidth = Math.random() * 3 + 1;
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = 0;
      ctx.moveTo(x, y);
      while (y < 512) {
        x += (Math.random() - 0.5) * 40;
        y += Math.random() * 30 + 10;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Subtle noise
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'}, ${Math.random() * 0.02})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
  });
}

function createTileTexture(color1: string, color2: string, groutColor: string): THREE.Texture {
  return createCanvasTexture(512, 512, (ctx) => {
    const tileSize = 128;
    const groutWidth = 4;

    ctx.fillStyle = groutColor;
    ctx.fillRect(0, 0, 512, 512);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const shade = Math.random() > 0.5 ? color1 : color2;
        ctx.fillStyle = shade;
        ctx.fillRect(
          col * tileSize + groutWidth / 2,
          row * tileSize + groutWidth / 2,
          tileSize - groutWidth,
          tileSize - groutWidth
        );
      }
    }
  });
}

function createCarpetTexture(color1: string, color2: string): THREE.Texture {
  return createCanvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 20000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '0,0,0' : '255,255,255'}, ${Math.random() * 0.08})`;
      ctx.fillRect(x, y, 1, 2);
    }
  });
}

// Texture catalog for the UI
export const TEXTURE_CATALOG = {
  wall: [
    { id: 'plaster-white', name: 'White Plaster', tileSize: 2.0 },
    { id: 'plaster-grey', name: 'Light Grey', tileSize: 2.0 },
    { id: 'brick-red', name: 'Red Brick', tileSize: 1.0 },
    { id: 'brick-white', name: 'White Brick', tileSize: 1.0 },
    { id: 'concrete', name: 'Concrete', tileSize: 2.0 },
    { id: 'wood-panel', name: 'Wood Panel', tileSize: 1.0 },
  ],
  floor: [
    { id: 'hardwood-oak', name: 'Oak Hardwood', tileSize: 1.0 },
    { id: 'hardwood-walnut', name: 'Walnut Hardwood', tileSize: 1.0 },
    { id: 'marble-white', name: 'White Marble', tileSize: 2.0 },
    { id: 'tile-grey', name: 'Grey Tile', tileSize: 0.5 },
    { id: 'carpet-beige', name: 'Beige Carpet', tileSize: 1.0 },
  ],
  ceiling: [
    { id: 'plaster-white', name: 'White Ceiling', tileSize: 2.0 },
    { id: 'plaster-grey', name: 'Grey Ceiling', tileSize: 2.0 },
    { id: 'wood-panel', name: 'Wood Ceiling', tileSize: 1.0 },
  ],
};
