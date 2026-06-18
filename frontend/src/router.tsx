import { createRouter } from '@tanstack/react-router';
import { Route as rootRoute } from './routes/__root';
import { Route as indexRoute } from './routes/index';
import { Route as mergeRoute } from './routes/merge';
import { Route as splitRoute } from './routes/split';
import { Route as compressRoute } from './routes/compress';
import { Route as rotateRoute } from './routes/rotate';
import { Route as watermarkRoute } from './routes/watermark';
import { Route as protectRoute } from './routes/protect';
import { Route as unlockRoute } from './routes/unlock';
import { Route as organizeRoute } from './routes/organize';
import { Route as repairRoute } from './routes/repair';
import { Route as pagenumbersRoute } from './routes/pagenumbers';
import { Route as esignRoute } from './routes/esign';
import { Route as ocrRoute } from './routes/ocr';
import { Route as flattenRoute } from './routes/flatten';
import { Route as convertRoute } from './routes/convert';
import { Route as shareRoute } from './routes/share';
import { Route as shareViewRoute } from './routes/share.$id';
import { Route as transferRoute } from './routes/transfer';

const routeTree = rootRoute.addChildren([
  indexRoute,
  mergeRoute,
  splitRoute,
  compressRoute,
  rotateRoute,
  watermarkRoute,
  protectRoute,
  unlockRoute,
  organizeRoute,
  repairRoute,
  pagenumbersRoute,
  esignRoute,
  ocrRoute,
  flattenRoute,
  convertRoute,
  shareRoute,
  shareViewRoute,
  transferRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
