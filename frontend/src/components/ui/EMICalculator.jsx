import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Calculator } from 'lucide-react'

const formatRupee = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`

const formatCompact = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`
  return formatRupee(n)
}

// Standard reducing-balance EMI formula
const calculateEMI = (principal, annualRatePct, years) => {
  const monthlyRate = annualRatePct / 12 / 100
  const months = years * 12
  if (monthlyRate === 0) return principal / months
  const factor = Math.pow(1 + monthlyRate, months)
  return (principal * monthlyRate * factor) / (factor - 1)
}

export default function EMICalculator({ price }) {
  const [loanAmount, setLoanAmount] = useState(Math.round(price * 0.8))
  const [rate, setRate] = useState(8.5)
  const [years, setYears] = useState(20)

  const { emi, totalPayment, totalInterest, downPayment } = useMemo(() => {
    const emi = calculateEMI(loanAmount, rate, years)
    const totalPayment = emi * years * 12
    const totalInterest = totalPayment - loanAmount
    return { emi, totalPayment, totalInterest, downPayment: price - loanAmount }
  }, [loanAmount, rate, years, price])

  const chartData = [
    { name: 'Principal', value: loanAmount },
    { name: 'Interest', value: Math.max(totalInterest, 0) },
  ]
  const COLORS = ['#E8532A', '#C9A96E']

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <Calculator size={18} className="text-primary-500" /> EMI Calculator
      </h2>
      <p className="text-gray-400 text-xs mb-5">Estimate your monthly home loan installment</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Loan Amount</label>
              <span className="text-sm font-semibold text-primary-500">{formatCompact(loanAmount)}</span>
            </div>
            <input
              type="range" min={100000} max={Math.max(price, 100000)} step={50000}
              value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
            <p className="text-xs text-gray-400 mt-1">Down payment: {formatCompact(Math.max(downPayment, 0))}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Interest Rate</label>
              <span className="text-sm font-semibold text-primary-500">{rate.toFixed(2)}%</span>
            </div>
            <input
              type="range" min={6} max={15} step={0.05}
              value={rate} onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Loan Tenure</label>
              <span className="text-sm font-semibold text-primary-500">{years} yrs</span>
            </div>
            <input
              type="range" min={1} max={30} step={1}
              value={years} onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <PieChart width={160} height={160}>
              <Pie data={chartData} dataKey="value" innerRadius={50} outerRadius={72} paddingAngle={2}>
                {chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i]} stroke="none" />)}
              </Pie>
              <Tooltip formatter={(v) => formatCompact(v)} />
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Monthly EMI</span>
              <span className="text-lg font-bold text-gray-900">{formatRupee(emi)}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-4 text-xs">
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500 inline-block" /> Principal {formatCompact(loanAmount)}
            </span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" /> Interest {formatCompact(Math.max(totalInterest, 0))}
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Total Payment: <span className="font-semibold text-gray-800">{formatCompact(totalPayment)}</span>
          </p>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-5 pt-4 border-t border-gray-100">
        This is an indicative estimate only, not a loan offer. Actual EMI, interest rate, and eligibility depend on the lender and your credit profile.
      </p>
    </div>
  )
}
