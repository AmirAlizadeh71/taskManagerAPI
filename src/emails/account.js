const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

sgMail.send({
    to: 'alizadeh.zarmehri71@gmail.com',
    from: 'alizadeh.zarmehri71@gmail.com',
    subject: 'sendgrid test',
    text: 'this is testing mail from sendgrid api'
})