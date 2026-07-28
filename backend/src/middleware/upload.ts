import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_BASE_DIR = path.resolve(process.cwd(), 'uploads/verifications')
const PROFILE_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/profile-images')

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
  'application/octet-stream',
]

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 MB

const storage = multer.diskStorage({
  destination: (request, _file, callback) => {
    const userId = (request as { userId?: string }).userId
    if (!userId) {
      callback(new Error('userId is required'), UPLOAD_BASE_DIR)
      return
    }
    const userDir = path.join(UPLOAD_BASE_DIR, userId)
    fs.mkdirSync(userDir, { recursive: true })
    callback(null, userDir)
  },
  filename: (request, file, callback) => {
    const userId = (request as { userId?: string }).userId
    if (!userId) {
      callback(new Error('userId is required'), `${file.fieldname}-unknown`)
      return
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname) || '.jpg'
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  },
})

const profileStorage = multer.diskStorage({
  destination: (request, _file, callback) => {
    const userId = (request as { userId?: string }).userId
    if (!userId) {
      callback(new Error('userId is required'), PROFILE_UPLOAD_DIR)
      return
    }
    const userDir = path.join(PROFILE_UPLOAD_DIR, userId)
    fs.mkdirSync(userDir, { recursive: true })
    callback(null, userDir)
  },
  filename: (_request, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname) || '.jpg'
    callback(null, `profile-${uniqueSuffix}${ext}`)
  },
})

function fileFilter(_request: Express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    callback(null, true)
  } else {
    callback(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, HEIC/HEIF`))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
})

export const profileImageUpload = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
})
