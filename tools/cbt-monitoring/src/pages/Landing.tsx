import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100">
      {/* Animated background accents */}
      <div className="blob top-[-60px] left-[-40px] w-[280px] h-[280px] bg-blue-300"></div>
      <div className="blob top-[220px] right-[-80px] w-[320px] h-[320px] bg-indigo-300" style={{ animationDelay: '1.5s' }}></div>
      <div className="blob bottom-[-80px] left-[30%] w-[260px] h-[260px] bg-sky-300" style={{ animationDelay: '0.7s' }}></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Community-Based Tourism, Made Visible
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            A simple, real-time system for tourism authorities to understand what’s happening 
            across communities, keep engagement regular, and grow inclusive tourism.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="mailto:alex.jeffries@gmail.com?subject=CBT%20Monitoring%20Demo&body=Hi%2C%20I%E2%80%99d%20like%20to%20see%20a%20demo%20of%20the%20CBT%20Monitoring%20Dashboard."
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Request a demo
            </a>
            <a href="#how-it-works" className="px-6 py-3 bg-white/80 backdrop-blur border border-gray-300 text-gray-800 rounded-lg hover:bg-white transition-all font-medium shadow-sm hover:-translate-y-0.5">
              See how it works
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Monitoring</h3>
            <p className="text-gray-600">
              View up-to-date status of all communities with color-coded indicators 
              showing engagement frequency and activity levels.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Updates</h3>
            <p className="text-gray-600">
              Submit quick updates after each community interaction. Track engagement 
              types, content produced, and plan future visits.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Reminders</h3>
            <p className="text-gray-600">
              Receive automated email reminders to keep records current. Never miss 
              an update with bi-weekly notifications.
            </p>
          </div>
        </div>

        {/* Outcomes & Benefits */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why it matters</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 bg-white/90">
              <h3 className="font-semibold text-gray-900 mb-1">Understand every community</h3>
              <p className="text-gray-600 text-sm">Real-time visibility on who was contacted, when, and what happened — all in one place.</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 bg-white/90">
              <h3 className="font-semibold text-gray-900 mb-1">Keep engagement regular</h3>
              <p className="text-gray-600 text-sm">Automated reminders ensure communities aren’t left behind. Green/Yellow/Red status highlights gaps.</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 bg-white/90">
              <h3 className="font-semibold text-gray-900 mb-1">Grow inclusive tourism</h3>
              <p className="text-gray-600 text-sm">Track content, visits, and outcomes to spread benefits beyond hotspots and support emerging communities.</p>
            </div>
          </div>
        </div>

        {/* Pain Points We Fix */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">The pain we remove</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white/90 hover:shadow-md transition-all">
              <div className="text-2xl">📎</div>
              <div>
                <h3 className="font-semibold text-gray-900">Scattered WhatsApps and spreadsheets</h3>
                <p className="text-gray-600 text-sm">Updates are lost across chats and files. We centralize every interaction so nothing slips.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white/90 hover:shadow-md transition-all">
              <div className="text-2xl">⏳</div>
              <div>
                <h3 className="font-semibold text-gray-900">Hard to know who needs a visit</h3>
                <p className="text-gray-600 text-sm">Color-coded status shows communities going quiet so teams can react quickly.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white/90 hover:shadow-md transition-all">
              <div className="text-2xl">🧾</div>
              <div>
                <h3 className="font-semibold text-gray-900">Reporting takes days</h3>
                <p className="text-gray-600 text-sm">No more manual counting. Monthly snapshots and CSV export are one click.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white/90 hover:shadow-md transition-all">
              <div className="text-2xl">📣</div>
              <div>
                <h3 className="font-semibold text-gray-900">Communities feel forgotten</h3>
                <p className="text-gray-600 text-sm">Automated reminders keep engagement regular and fair — across regions, not just hotspots.</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <ol className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Staff submit quick updates</h3>
                  <p className="text-gray-600">After each community interaction, staff record engagement type, content produced, and next planned visit.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Data syncs automatically</h3>
                  <p className="text-gray-600">Real-time dashboard shows community status and trends across the country.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Act on what matters</h3>
                  <p className="text-gray-600">Color-coded status (Green/Yellow/Red) surfaces communities needing attention, so teams plan support where it’s needed.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Stay consistent</h3>
                  <p className="text-gray-600">Automated reminders keep engagement regular; admins get alerts for communities without updates in 21+ days.</p>
                </div>
              </li>
            </ol>
          </div>
          <div className="text-center mt-10">
            <a
              href="mailto:alex.jeffries@gmail.com?subject=CBT%20Monitoring%20Demo"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Talk to us about piloting
            </a>
          </div>
        </div>

        {/* Social proof / quick metrics */}
        <div className="mt-8 text-center text-gray-700">
          <div className="inline-flex items-center gap-8 bg-white/80 backdrop-blur rounded-xl px-6 py-4 border border-gray-200 shadow-sm">
            <div>
              <div className="text-2xl font-bold text-gray-900">2–3x</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">more consistent updates</div>
            </div>
            <div className="hidden md:block h-8 w-px bg-gray-200" />
            <div>
              <div className="text-2xl font-bold text-gray-900"><span className="align-text-top">↓</span>60%</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">time spent on monthly reports</div>
            </div>
            <div className="hidden md:block h-8 w-px bg-gray-200" />
            <div>
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">communities tracked in one place</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p>Part of the <strong>Tourism Commons</strong> platform</p>
          <p className="text-sm mt-2">Supporting tourism development and digital capacity building</p>
        </div>
      </div>
    </div>
  );
}

