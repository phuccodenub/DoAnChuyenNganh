import { Facebook, Linkedin, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4">
        {/* Main footer content */}
        <div className="grid grid-cols-2 gap-8 pb-12 md:grid-cols-3 lg:grid-cols-6">
          {/* Logo and Tagline */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <img src="/GekLearn.png" alt="GekLearn logo" className="h-8 w-auto object-contain" />
              {/* <span className="text-xl font-bold">
                <span className="text-white">Gek</span>
                <span className="text-slate-300">Learn</span>
              </span> */}
            </div>
            <p className="text-sm text-slate-400">
              Design amazing digital experiences that create more happy in the world.
            </p>
          </div>

          {/* Technical Skills */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Technical Skills</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">ChatGPT</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Coding</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  Computer
                  <span className="rounded bg-slate-700 px-1.5 py-0.5 text-xs text-slate-300">New</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Cybersecurity</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Ethical Hacking</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Python</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Java Programming</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Web Development</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Product Design</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">IT Specialist</a>
              </li>
            </ul>
          </div>

          {/* Analytical Skills */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Analytical Skills</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">AI</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Big Data</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Business Analysis</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Data Science</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Machine Learning</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Microsoft Excel</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">SQL</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">SEO</a>
              </li>
            </ul>
          </div>

          {/* Business Skills */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Business Skills</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">Accounting</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Digital Marketing</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">E-Commerce</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Finance</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Google</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Graphic Design</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">IBM</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Project Management</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Media Marketing</a>
              </li>
            </ul>
          </div>

          {/* Career Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Career Resources</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Facebook</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">GitHub</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">AngelList</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Dribbble</a>
              </li>
            </ul>
          </div>

          {/* GekLearn */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">GekLearn</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">About</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">What We Offer</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Leadership</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Careers</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Catalog</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">GekLearn Plus</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Degrees</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">For Enterprise</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">For Government</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-slate-400">© 2025 GekLearn. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

