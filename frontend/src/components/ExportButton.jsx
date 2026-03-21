import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ExportButton({ profileName }) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const sections = document.querySelectorAll('[data-export-section]')
      if (sections.length === 0) {
        setExporting(false)
        return
      }

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10

      // Cover page
      pdf.setFillColor(10, 10, 15)
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      pdf.setTextColor(0, 240, 255)
      pdf.setFontSize(28)
      pdf.text('BlindSpot AI', pageWidth / 2, 60, { align: 'center' })
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(14)
      pdf.text('Career Intelligence Report', pageWidth / 2, 75, { align: 'center' })
      pdf.setFontSize(11)
      pdf.setTextColor(180, 180, 180)
      pdf.text(profileName || 'Anonymous', pageWidth / 2, 95, { align: 'center' })
      pdf.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, 105, { align: 'center' })

      // Capture each section
      for (const section of sections) {
        pdf.addPage()
        pdf.setFillColor(10, 10, 15)
        pdf.rect(0, 0, pageWidth, pageHeight, 'F')

        const canvas = await html2canvas(section, {
          backgroundColor: '#0a0a0f',
          scale: 2,
          useCORS: true,
          logging: false,
        })

        const imgData = canvas.toDataURL('image/png')
        const imgWidth = pageWidth - margin * 2
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // If image is taller than page, scale to fit
        const maxHeight = pageHeight - margin * 2
        const finalWidth = imgHeight > maxHeight ? imgWidth * (maxHeight / imgHeight) : imgWidth
        const finalHeight = imgHeight > maxHeight ? maxHeight : imgHeight

        pdf.addImage(imgData, 'PNG', margin, margin, finalWidth, finalHeight)
      }

      const date = new Date().toISOString().split('T')[0]
      const safeName = (profileName || 'Anonymous').replace(/[^a-zA-Z0-9]/g, '_')
      pdf.save(`BlindSpot_Report_${safeName}_${date}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 micro-press"
      style={{
        borderColor: 'var(--border-default)',
        color: 'var(--text-tertiary)',
      }}
    >
      {exporting ? (
        <>
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Export PDF
        </>
      )}
    </motion.button>
  )
}
