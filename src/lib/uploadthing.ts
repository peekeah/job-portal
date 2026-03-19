import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { authMiddleware } from '@/lib/auth-middleware';

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({ pdf: { maxFileSize: '8MB' } })
    .middleware(async ({ req }) => {
      const token = await authMiddleware(req, 'applicant');
      return { email: token.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, email: metadata.email };
    }),
  avatarUploader: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const token = await authMiddleware(req);
      return { email: token.email, userType: token.user_type };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, email: metadata.email };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
