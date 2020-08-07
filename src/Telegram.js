require('dotenv').config()
const { Telegraf, Extra } = require('telegraf')
const Markup = require('telegraf/markup')
const WizardScene = require('telegraf/scenes/wizard')
const Stage = require('telegraf/stage')
const session = require('telegraf/session')

const getText = require('./Tesseract')

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => {
    ctx.reply(
        `Welcome ${ctx.from.first_name}! How can I help you!`, 
        Markup.inlineKeyboard([
            Markup.callbackButton('Convert Image to PDF Text', 'generate_pdf'),
            Markup.callbackButton('Convert Image to Text', 'generate_text')
      ]).extra())

    // console.log('ctx', ctx.update.message)
})

bot.action('BACK', (ctx) => {
    ctx.reply(
        `Glat That I help you with you request!`
    )

    ctx.reply(
        Markup.inlineKeyboard([
            Markup.callbackButton('Convert Image to PDF Text', 'generate_pdf'),
            Markup.callbackButton('Convert Image to Text', 'generate_text')
      ]).extra())
})

const imageToTextConverter = new WizardScene(
    'img-to-text',
    (ctx) => {
        ctx.reply(
            `Please upload an image to get text from!
Supported image format: *PNG*, *JPG*, *JPEG*...
            `,
            Extra.markdown()
        )

        return ctx.wizard.next()
    },
    async (ctx) => {
        const {photo} = await ctx.update.message
        
        const largestImage = photo.reduce((prev, current) => {
            return +prev.width > +current.width ? prev : current
        })
        
        const image = await ctx.telegram.getFileLink(largestImage.file_id)

        ctx.wizard.state.image = image

        ctx.reply(
            `Please Select desired langauge:`, 
            Markup.inlineKeyboard([
                Markup.callbackButton('English', 'eng'),
                Markup.callbackButton('Arabic', 'ara'),
                Markup.callbackButton('Turkish', 'tur')
          ]).extra())

          return ctx.wizard.next()
    },
    async (ctx) => {
        const langauge = (ctx.wizard.state.langauge = ctx.update.callback_query.data)
        const image = ctx.wizard.state.image
        
        ctx.reply(`Tesseract started...`)

        const text = await getText(langauge, image)

        ctx.reply(
            `Here is extracted Text: \n\n ${text}`, 
            Markup.inlineKeyboard([
             Markup.callbackButton('🔙 Back', 'BACK'),
             Markup.callbackButton('🔙 Convert another Image', 'generate_text'),
          ]).extra())

        return ctx.scene.leave()
    }
)

const stage = new Stage([imageToTextConverter], { default: 'img-to-text' })
bot.use(session())
bot.use(stage.middleware())

bot.launch()