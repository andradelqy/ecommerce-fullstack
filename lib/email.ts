import { Resend } from 'resend'
import { formatBRL } from './utils'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  variations?: {
    size?: string
    color?: string
  }
}

interface OrderEmailData {
  id: string
  customer_name?: string
  customer_email: string
  total: number
  subtotal: number
  discount: number
  shipping: number
  items: OrderItem[]
  shipping_address?: {
    name?: string
    address?: string
    number?: string
    city?: string
    state?: string
    zip?: string
  }
}

export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY não configurada nas variáveis de ambiente.')
    return { success: false, error: 'Chave do Resend não configurada' }
  }

  const resend = new Resend(apiKey)

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 0;">
          <p style="margin: 0; font-weight: bold; color: #0f172a;">${item.name}</p>
          ${
            item.variations?.size || item.variations?.color
              ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">
                  ${item.variations.size ? `Tamanho: ${item.variations.size}` : ''} 
                  ${item.variations.color ? `| Cor: ${item.variations.color}` : ''}
                </p>`
              : ''
          }
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Qtd: ${item.quantity}</p>
        </td>
        <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #0f172a;">
          ${formatBRL(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Pedido Confirmado #${order.id.slice(0, 8)}</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <div style="background-color: #0f172a; padding: 28px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">E-COMMERCE STORE</h1>
            <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px;">Seu pedido foi confirmado com sucesso!</p>
          </div>

          <!-- Content -->
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #334155; margin-top: 0;">
              Olá, <strong>${order.customer_name || 'Cliente'}</strong>! 👋
            </p>
            <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
              Recebemos a confirmação do seu pagamento e seu pedido já está sendo preparado com muito cuidado por nossa equipe.
            </p>

            <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 13px; color: #475569;">
                <strong>Número do Pedido:</strong> #${order.id}
              </p>
            </div>

            <!-- Tabela de Itens -->
            <h3 style="font-size: 16px; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-top: 24px;">
              Resumo dos Produtos
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Totais -->
            <div style="margin-top: 20px; padding-top: 16px; border-top: 2px solid #e2e8f0;">
              <table style="width: 100%; font-size: 14px; color: #475569;">
                <tr>
                  <td style="padding: 4px 0;">Subtotal:</td>
                  <td style="padding: 4px 0; text-align: right;">${formatBRL(order.subtotal)}</td>
                </tr>
                ${
                  order.discount > 0
                    ? `<tr>
                        <td style="padding: 4px 0; color: #16a34a;">Desconto aplicado:</td>
                        <td style="padding: 4px 0; text-align: right; color: #16a34a;">-${formatBRL(order.discount)}</td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 4px 0;">Frete:</td>
                  <td style="padding: 4px 0; text-align: right;">${order.shipping > 0 ? formatBRL(order.shipping) : 'Grátis'}</td>
                </tr>
                <tr style="font-size: 18px; font-weight: bold; color: #0f172a;">
                  <td style="padding: 12px 0 0 0;">Total:</td>
                  <td style="padding: 12px 0 0 0; text-align: right; color: #2563eb;">${formatBRL(order.total)}</td>
                </tr>
              </table>
            </div>

            ${
              order.shipping_address?.address
                ? `
                <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px;">Endereço de Entrega:</h4>
                  <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.4;">
                    ${order.shipping_address.address}, ${order.shipping_address.number || 'S/N'}<br/>
                    ${order.shipping_address.city} - ${order.shipping_address.state}<br/>
                    CEP: ${order.shipping_address.zip || ''}
                  </p>
                </div>
                `
                : ''
            }
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              Esta é uma mensagem automática de confirmação de compra.<br/>
              Obrigado por comprar conosco!
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const response = await resend.emails.send({
      from: 'Loja Virtual <onboarding@resend.dev>',
      to: order.customer_email,
      subject: `🎉 Pedido Confirmado! #${order.id.slice(0, 8)}`,
      html,
    })
    return { success: true, data: response }
  } catch (error) {
    console.error('Erro ao enviar e-mail via Resend:', error)
    return { success: false, error }
  }
}