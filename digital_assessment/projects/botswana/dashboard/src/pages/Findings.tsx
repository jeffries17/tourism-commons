import type { DashboardData } from '../types'
import { sentimentLabel } from '../types'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface Props { data: DashboardData }

interface Finding {
  id: string
  type: 'critical' | 'positive' | 'watch'
  title: string
  summary: string
  detail: string
  evidence: string
  action: string
}

function generateFindings(data: DashboardData): Finding[] {
  const { summary, stakeholder_data } = data
  const themes = summary.theme_averages
  const sectors = summary.sector_summaries

  // Total mentions per theme across all operators
  const mentions: Record<string, number> = {}
  for (const op of stakeholder_data) {
    for (const [t, v] of Object.entries(op.theme_scores)) {
      mentions[t] = (mentions[t] ?? 0) + (v.mentions ?? 0)
    }
  }
  const totalMentions = Object.values(mentions).reduce((a, b) => a + b, 0)
  const mentionShare = (t: string) => ((mentions[t] ?? 0) / totalMentions * 100).toFixed(0)

  const findings: Finding[] = []
  const sl = (score: number) => sentimentLabel(score).label

  // Wildlife — high mentions, positive sentiment
  if ((themes.wildlife_experience ?? 0) > 0.18) {
    findings.push({
      id: 'wildlife',
      type: 'positive',
      title: 'Wildlife is what visitors talk about most — and they\'re positive',
      summary: `Wildlife Experience accounts for ${mentionShare('wildlife_experience')}% of all theme mentions — more than any other theme — and visitor sentiment is "${sl(themes.wildlife_experience ?? 0)}". When visitors describe their trip, wildlife is the headline. Guide knowledge and tracking ability are the most cited reasons encounters stand out.`,
      detail: 'High mention volume combined with positive sentiment is the best signal in this analysis: it means the experience is happening, it\'s memorable, and visitors are choosing to write about it. Guide quality is the variable that determines whether a sighting becomes a story.',
      evidence: `${(mentions.wildlife_experience ?? 0).toLocaleString()} mentions (${mentionShare('wildlife_experience')}% of total). Sentiment: ${(themes.wildlife_experience ?? 0).toFixed(3)}.`,
      action: 'Invest in guide training and certification. Recognize top-performing guides publicly. Develop structured guide mentorship programs across operators.',
    })
  }

  // Atmosphere — high mentions, strong sentiment
  if ((themes.atmosphere_wilderness ?? 0) > 0.28) {
    findings.push({
      id: 'atmosphere',
      type: 'positive',
      title: 'The wilderness experience registers strongly — and visitors are writing about it',
      summary: `Atmosphere & Wilderness is the highest-scoring theme ("${sl(themes.atmosphere_wilderness ?? 0)}") and visitors mention it frequently. Words like "untouched", "exclusive", "silence", and "once in a lifetime" appear at high rates across reviews. This is the experience Botswana's positioning is built on, and the reviews confirm it\'s delivering.`,
      detail: 'When a theme scores high and gets mentioned often, it means the experience is not just good — it\'s visible enough that visitors notice it and choose to describe it. The risk here is protection: if crowding increases or infrastructure expands, this score will fall.',
      evidence: `${(mentions.atmosphere_wilderness ?? 0).toLocaleString()} mentions. Sentiment: ${(themes.atmosphere_wilderness ?? 0).toFixed(3)} — highest of all 11 themes.`,
      action: 'Monitor for overdevelopment and crowding at key sites. Use visitor language from reviews directly in destination marketing materials.',
    })
  }

  // Accessibility — high mentions, poor sentiment
  {
    const score = themes.accessibility_logistics ?? 0
    const m = mentions.accessibility_logistics ?? 0
    // Rank themes by mention count to describe position
    const mentionRank = Object.entries(mentions).sort((a, b) => b[1] - a[1]).findIndex(([t]) => t === 'accessibility_logistics') + 1
    if (score < 0.15 && m > 500) {
      findings.push({
        id: 'access_gap',
        type: 'critical',
        title: 'Getting there is a friction point — and visitors are writing about it',
        summary: `Accessibility & Logistics is the ${mentionRank === 5 ? '5th' : mentionRank + 'th'} most-mentioned theme — visitors write about access as often as they write about food and dining. But sentiment is "${sl(score)}", making it one of the lowest-scoring themes by a significant margin. When something is mentioned frequently and rated poorly, it points to a real operational issue, not an isolated complaint.`,
        detail: 'Long drives, rough roads, and transfer logistics appear repeatedly in negative contexts. Accessibility shapes the first and last impression of a trip. At a premium price point, friction in getting there creates a gap between expectation and experience before the safari has even started.',
        evidence: `${m.toLocaleString()} mentions — ${mentionRank === 5 ? '5th' : mentionRank + 'th'} most-mentioned theme. Sentiment: ${score.toFixed(3)}.`,
        action: 'Review transfer logistics and pre-arrival communication across operators. Identify the highest-friction access points and assess whether infrastructure or communication improvements are feasible.',
      })
    }
  }

  // Reserves underperforming vs operators
  const reserveSentiment = sectors.reserve?.avg_sentiment ?? 0
  const operatorSentiment = sectors.operator?.avg_sentiment ?? 0
  if (operatorSentiment - reserveSentiment > 0.08) {
    findings.push({
      id: 'reserves_gap',
      type: 'critical',
      title: 'Reserves are scoring considerably lower than operators — a visitor infrastructure gap',
      summary: `Tour operators score ${operatorSentiment.toFixed(2)} vs. reserves at ${reserveSentiment.toFixed(2)} — a gap of ${(operatorSentiment - reserveSentiment).toFixed(2)} points on a scale where the difference between "Mixed" and "Strong" is about 0.20. The parks and reserves that are central to Botswana's tourism product are underperforming the operators that work within them.`,
      detail: 'This gap suggests the reserve experience itself — entry processes, roads, facilities, signage, and visitor infrastructure — is pulling sentiment down, even when wildlife and wilderness quality are high. Operators are compensating with strong service, but they\'re working against a weak base. Improving reserve infrastructure would likely raise scores across both categories.',
      evidence: `Operators: ${operatorSentiment.toFixed(3)} | Reserves: ${reserveSentiment.toFixed(3)} | Gap: ${(operatorSentiment - reserveSentiment).toFixed(3)} points.`,
      action: 'Audit visitor infrastructure at key reserve entry points. Prioritize road quality, ablution facilities, and information provision. Identify which reserves are driving the gap.',
    })
  }

  // Eco-conservation — low mentions, low sentiment — compare to wildlife
  if ((themes.eco_conservation ?? 0) < 0.18) {
    const wildlifeMentions = mentions.wildlife_experience ?? 0
    const ecoMentions = mentions.eco_conservation ?? 0
    const ratio = wildlifeMentions > 0 ? Math.round(wildlifeMentions / ecoMentions) : 0
    findings.push({
      id: 'eco_gap',
      type: 'critical',
      title: 'Conservation is not appearing in visitor reviews — the story isn\'t translating',
      summary: `Visitors mention Wildlife Experience ${ratio}x more often than Eco & Conservation (${wildlifeMentions.toLocaleString()} vs. ${ecoMentions.toLocaleString()} mentions). Both are central to how Botswana positions itself — but one is translating into visitor experience and the other isn\'t. When conservation does appear in reviews, sentiment is only "${sl(themes.eco_conservation ?? 0)}", suggesting the moments that do land aren\'t particularly strong.`,
      detail: 'Conservation is central to Botswana\'s brand identity. If visitors finish a trip and don\'t write about it, they didn\'t feel part of that story. The gap between wildlife mentions and conservation mentions is a signal about experience design and guide communication — not about whether conservation work is happening.',
      evidence: `Eco & Conservation: ${ecoMentions.toLocaleString()} mentions, sentiment ${(themes.eco_conservation ?? 0).toFixed(3)}. Wildlife Experience: ${wildlifeMentions.toLocaleString()} mentions — ${ratio}x more frequent.`,
      action: 'Work with operators to build conservation storytelling into guest experiences. Train guides to communicate anti-poaching work, community benefit programs, and concession management in ways visitors will remember and repeat.',
    })
  }

  // Adventure activities — very low mentions
  if ((themes.adventure_activities ?? 0) < 0.2 && (mentions.adventure_activities ?? 0) < 400) {
    findings.push({
      id: 'adventure_gap',
      type: 'critical',
      title: 'Adventure activities are almost invisible in reviews',
      summary: `Mokoro trips, walking safaris, horseback riding, and boat cruises are available across the destination — but Adventure Activities generates just ${(mentions.adventure_activities ?? 0).toLocaleString()} mentions, fewer than any theme except safety. Visitors are not writing about these experiences.`,
      detail: 'There are two possible explanations, and they require different responses. First, activities may not be widely offered — if only a few operators include them, most visitors never encounter them. Second, activities may be happening but not creating moments visitors feel compelled to describe: they\'re present in the itinerary but not positioned as highlights. The first is an availability problem; the second is an experience design problem.',
      evidence: `${(mentions.adventure_activities ?? 0).toLocaleString()} mentions — second-fewest of all 11 themes. Sentiment: ${(themes.adventure_activities ?? 0).toFixed(3)}.`,
      action: 'Audit which operators include activities in their packages and which don\'t. For those that do, assess whether activities are positioned as a highlight or an add-on. Train guides to make activity experiences more distinctive and memorable.',
    })
  }

  // Safety — fewest mentions
  if ((themes.safety ?? 0) < 0.15) {
    findings.push({
      id: 'safety',
      type: 'watch',
      title: 'Safety is the least-mentioned theme — visitors aren\'t writing about it',
      summary: `Safety has the fewest mentions of any theme (${mentionShare('safety')}% of total). Safety is rarely discussed in reviews unless something went wrong or a briefing was particularly memorable. The low volume here suggests operators are not making their safety practices visible enough for visitors to notice and comment on them.`,
      detail: 'In wildlife environments with real risk — animal encounters, malaria, remote locations — safety protocols are genuinely important. When operators do communicate safety well, it builds confidence and becomes a differentiator. The current data doesn\'t tell us safety is poor; it tells us it\'s not being communicated in a way visitors register.',
      evidence: `${(mentions.safety ?? 0).toLocaleString()} mentions (${mentionShare('safety')}% of total) — fewest of all 11 themes. Sentiment: ${(themes.safety ?? 0).toFixed(3)}.`,
      action: 'Encourage operators to make safety briefings a more visible, structured part of the guest experience. Track whether safety mentions increase as communication improves.',
    })
  }

  // Value for money
  if ((themes.value_money ?? 0) < 0.2) {
    findings.push({
      id: 'value',
      type: 'watch',
      title: 'When visitors write about price, sentiment is mixed',
      summary: `Value for Money sentiment is "${sl(themes.value_money ?? 0)}" with ${mentionShare('value_money')}% mention share. At Botswana\'s price point, a mixed value signal warrants monitoring. Visitors who feel the experience matched the cost rarely mention price at all — those who mention it are often signaling a gap.`,
      detail: 'Premium pricing creates high expectations. When the experience falls short — particularly in areas like reserve infrastructure, activity range, or access — visitors push back on value. This tends to show up most in reserve reviews, where managed infrastructure is below the standard visitors pay for.',
      evidence: `${(mentions.value_money ?? 0).toLocaleString()} mentions. Sentiment: ${(themes.value_money ?? 0).toFixed(3)}.`,
      action: 'Track value sentiment alongside the themes that most affect perceived worth: service quality, activity range, and accommodation. A rising value score is likely a downstream result of improving those areas.',
    })
  }

  return findings
}

const FINDING_STYLES = {
  critical: { border: 'border-[#FCA5A5]', bg: 'bg-[#FEF2F2]', badge: 'bg-[#DC2626] text-white', icon: AlertTriangle, iconColor: '#DC2626', label: 'Needs Attention' },
  positive: { border: 'border-[#6EE7B7]', bg: 'bg-[#F0FDF4]', badge: 'bg-[#059669] text-white', icon: CheckCircle, iconColor: '#059669', label: 'Strength' },
  watch:    { border: 'border-[#FDE68A]', bg: 'bg-[#FFFBEB]', badge: 'bg-[#D97706] text-white', icon: Info, iconColor: '#D97706', label: 'Monitor' },
}

export default function Findings({ data }: Props) {
  const findings = generateFindings(data)
  const critical = findings.filter(f => f.type === 'critical')
  const positive = findings.filter(f => f.type === 'positive')
  const watch    = findings.filter(f => f.type === 'watch')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Key Findings</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Analysis-derived findings to inform the 3-year improvement program. Each finding includes evidence from visitor reviews and a recommended action.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#DC2626]">{critical.length}</p>
          <p className="text-xs text-[#DC2626] font-medium mt-0.5">Priority Areas</p>
        </div>
        <div className="bg-[#F0FDF4] border border-[#6EE7B7] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#059669]">{positive.length}</p>
          <p className="text-xs text-[#059669] font-medium mt-0.5">Strengths to Build On</p>
        </div>
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#D97706]">{watch.length}</p>
          <p className="text-xs text-[#D97706] font-medium mt-0.5">Areas to Monitor</p>
        </div>
      </div>

      {/* Findings — critical first */}
      {[...critical, ...positive, ...watch].map(finding => {
        const style = FINDING_STYLES[finding.type]
        const Icon = style.icon
        return (
          <div key={finding.id} className={`bg-white rounded-xl border ${style.border} shadow-sm overflow-hidden`}>
            <div className={`${style.bg} px-6 py-4 flex items-start gap-3`}>
              <Icon size={18} style={{ color: style.iconColor }} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>{style.label}</span>
                </div>
                <h3 className="font-semibold text-[#1C1C1E] leading-snug">{finding.title}</h3>
                <p className="text-sm text-[#374151] mt-1 leading-relaxed">{finding.summary}</p>
              </div>
            </div>
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#E5E7EB]">
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Detail</p>
                <p className="text-sm text-[#374151] leading-relaxed">{finding.detail}</p>
                <p className="text-xs text-[#9CA3AF] mt-2 italic">{finding.evidence}</p>
              </div>
              <div className={`rounded-lg p-4 ${finding.type === 'critical' ? 'bg-[#FEF2F2]' : finding.type === 'positive' ? 'bg-[#F0FDF4]' : 'bg-[#FFFBEB]'}`}>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Recommended Action</p>
                <p className="text-sm text-[#374151] leading-relaxed">{finding.action}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
