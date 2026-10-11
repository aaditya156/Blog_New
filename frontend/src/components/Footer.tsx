import React from "react";
import Link from "next/link";
import { Sparkles, Layers, Cpu, ShieldCheck } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900">PulseBlog</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              An enterprise distributed blogging architecture powered by decoupled microservices, RabbitMQ messaging, and Next.js.
            </p>
          </div>

          {/* Architecture overview */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Services</h4>
            <ul className="text-xs space-y-2">
              <li className="flex items-center gap-1.5 text-slate-600">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                User Service (Port 4001)
              </li>
              <li className="flex items-center gap-1.5 text-slate-600">
                <Layers className="w-3.5 h-3.5 text-pink-600" />
                Author Service (Port 4002)
              </li>
              <li className="flex items-center gap-1.5 text-slate-600">
                <Layers className="w-3.5 h-3.5 text-violet-600" />
                Blog Read Service (Port 4003)
              </li>
            </ul>
          </div>

          {/* Microservice Highlights */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Infrastructure</h4>
            <ul className="text-xs space-y-2">
              <li className="flex items-center gap-1.5 text-slate-600">
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                RabbitMQ Event Bus (AMQP)
              </li>
              <li className="flex items-center gap-1.5 text-slate-600">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                MongoDB Event Sourced Read Model
              </li>
              <li className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                JWT & Google OAuth2 Auth
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Platform</h4>
            <ul className="text-xs space-y-2">
              <li>
                <Link href="/" className="hover:text-indigo-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-indigo-600 transition">
                  Explore Stories
                </Link>
              </li>
              <li>
                <Link href="/blog/new" className="hover:text-indigo-600 transition">
                  Author Studio
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-600 transition">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PulseBlog Microservice Ecosystem. Built with Next.js, Express & RabbitMQ.</p>
          <div className="flex gap-6">
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Microservices Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
