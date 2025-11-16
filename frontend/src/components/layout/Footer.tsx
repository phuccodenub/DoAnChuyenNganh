import { Link } from 'react-router-dom'
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
                <Link to="/courses?category=ai-ml" className="hover:text-white transition-colors">ChatGPT</Link>
              </li>
              <li>
                <Link to="/courses?category=web-dev" className="hover:text-white transition-colors">Coding</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  Computer
                  <span className="rounded bg-slate-700 px-1.5 py-0.5 text-xs text-slate-300">New</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">Cybersecurity</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">Ethical Hacking</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">Python</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">Java Programming</Link>
              </li>
              <li>
                <Link to="/courses?category=web-dev" className="hover:text-white transition-colors">Web Development</Link>
              </li>
              <li>
                <Link to="/courses?category=design" className="hover:text-white transition-colors">Product Design</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">IT Specialist</Link>
              </li>
            </ul>
          </div>

          {/* Analytical Skills */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Analytical Skills</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/courses?category=ai-ml" className="hover:text-white transition-colors">AI</Link>
              </li>
              <li>
                <Link to="/courses?category=data-science" className="hover:text-white transition-colors">Big Data</Link>
              </li>
              <li>
                <Link to="/courses?category=business" className="hover:text-white transition-colors">Business Analysis</Link>
              </li>
              <li>
                <Link to="/courses?category=data-science" className="hover:text-white transition-colors">Data Science</Link>
              </li>
              <li>
                <Link to="/courses?category=ai-ml" className="hover:text-white transition-colors">Machine Learning</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">Microsoft Excel</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">SQL</Link>
              </li>
              <li>
                <Link to="/courses?category=marketing" className="hover:text-white transition-colors">SEO</Link>
              </li>
            </ul>
          </div>

          {/* Business Skills */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Business Skills</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">Accounting</Link>
              </li>
              <li>
                <Link to="/courses?category=marketing" className="hover:text-white transition-colors">Digital Marketing</Link>
              </li>
              <li>
                <Link to="/courses?category=business" className="hover:text-white transition-colors">E-Commerce</Link>
              </li>
              <li>
                <Link to="/courses?category=business" className="hover:text-white transition-colors">Finance</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">Google</Link>
              </li>
              <li>
                <Link to="/courses?category=design" className="hover:text-white transition-colors">Graphic Design</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">IBM</Link>
              </li>
              <li>
                <Link to="/courses?category=business" className="hover:text-white transition-colors">Project Management</Link>
              </li>
              <li>
                <Link to="/courses?category=marketing" className="hover:text-white transition-colors">Media Marketing</Link>
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
                <Link to="/about" className="hover:text-white transition-colors">About</Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">What We Offer</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Leadership</Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Careers</a>
              </li>
              <li>
                <Link to="/courses" className="hover:text-white transition-colors">Catalog</Link>
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
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

