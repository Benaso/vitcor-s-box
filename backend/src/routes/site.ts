import { Router } from 'express'
import { siteContent } from '../data/siteContent.js'

const router = Router()

router.get('/', (_request, response) => {
  response.json(siteContent)
})

export default router
