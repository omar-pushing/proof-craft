import { writeFileSync } from 'node:fs';
import { BODY, KEYHOLE, VIEWBOX } from '../src/components/brand/paths.js';
writeFileSync(new URL('../public/favicon.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}"><path fill="#161A2E" fill-rule="evenodd" d="${BODY}"/><path fill="#FFD84D" d="${KEYHOLE}"/></svg>`);
