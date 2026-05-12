// backend/src/services/projectStorage.ts
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads/projects')
const SANDBOX_ROOT = path.resolve(__dirname, '../../sandbox')

export function getProjectUploadDir(projectId: number) {
  return path.join(UPLOADS_ROOT, String(projectId))
}

export function getSandboxDir(sandboxId: string) {
  return path.join(SANDBOX_ROOT, sandboxId)
}

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

export async function saveUploadedFiles(
  files: Express.Multer.File[],
  projectId: number
): Promise<{ images: string[]; videos: string[] }> {
  const dir = getProjectUploadDir(projectId)
  await ensureDir(dir)

  const images: string[] = []
  const videos: string[] = []

  for (const file of files) {
    const dest = path.join(dir, file.originalname)
    await fs.rename(file.path, dest)
    const url = `/uploads/projects/${projectId}/${file.originalname}`
    if (file.mimetype.startsWith('video/')) {
      videos.push(url)
    } else {
      images.push(url)
    }
  }

  return { images, videos }
}

export async function deleteProjectFiles(projectId: number) {
  const dir = getProjectUploadDir(projectId)
  await fs.rm(dir, { recursive: true, force: true })
}

export async function deleteSandboxDir(sandboxId: string) {
  const dir = getSandboxDir(sandboxId)
  await fs.rm(dir, { recursive: true, force: true })
}
