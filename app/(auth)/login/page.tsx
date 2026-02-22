'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Formata telefone para +55...
    const cleanPhone = phone.replace(/\D/g, '')
    const fullPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`

    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    })

    if (error) {
      toast.error('Erro ao enviar código. Tente novamente.')
      console.error(error)
    } else {
      toast.success('Código enviado por SMS!')
      setStep('otp')
    }

    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const cleanPhone = phone.replace(/\D/g, '')
    const fullPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`

    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: otp,
      type: 'sms',
    })

    if (error) {
      toast.error('Código inválido. Tente novamente.')
    } else {
      toast.success('Login realizado!')
      window.location.href = '/'
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-pharos-blue font-bold text-2xl">P</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Pharos Corretor</h1>
        <p className="text-white/60 text-sm mt-1">Área do Corretor</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seu WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(47) 99999-9999"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-pharos-blue"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark transition disabled:opacity-50 text-lg"
            >
              {loading ? 'Enviando...' : 'Receber código'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de verificação
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-pharos-blue"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Enviado para {phone}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-pharos-blue text-white font-semibold rounded-xl hover:bg-pharos-blue-dark transition disabled:opacity-50 text-lg"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full py-2 text-pharos-blue text-sm"
            >
              Trocar número
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
