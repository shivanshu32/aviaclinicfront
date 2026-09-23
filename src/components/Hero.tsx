'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarCheck2, Check, CirclePlay, FileHeart, ShieldCheck, Sparkles } from 'lucide-react';

export default function Hero() {
  return <section className="relative overflow-hidden border-b border-emerald-100 bg-[#f7fbf9] lg:h-[calc(100svh-108px)] lg:min-h-[560px] lg:max-h-[820px]">
    <div className="absolute -right-48 -top-40 h-[560px] w-[560px] rounded-full bg-emerald-100/60 blur-3xl" aria-hidden="true" />
    <div className="absolute -bottom-56 left-1/3 h-[440px] w-[440px] rounded-full bg-teal-100/50 blur-3xl" aria-hidden="true" />
    <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:h-full lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-6 xl:gap-14">
      <div className="max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm"><Sparkles className="h-3.5 w-3.5" /> Modern healthcare operations, simplified</div>
        <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-slate-900 sm:text-5xl lg:text-[clamp(42px,3.8vw,56px)]">Run your clinic with clarity and confidence.</h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 lg:text-[17px]">One secure workspace for patients, appointments, consultations, pharmacy, billing and reports—designed for the way modern clinical teams work.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-800/15 transition-all hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-xl">Start free trial <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>
          <Link href="#features" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:border-emerald-300 hover:bg-emerald-50"><CirclePlay className="h-4 w-4 text-emerald-700" /> Explore features</Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">{['14-day free trial', 'No credit card', 'Secure patient data'].map(item => <span key={item} className="flex items-center gap-1.5"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-3 w-3" /></span>{item}</span>)}</div>
        <div className="mt-7 grid max-w-lg grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="px-3 first:pl-0"><CalendarCheck2 className="mb-2 h-5 w-5 text-emerald-700" /><p className="text-xs font-semibold text-slate-800">Faster scheduling</p></div>
          <div className="px-3"><FileHeart className="mb-2 h-5 w-5 text-emerald-700" /><p className="text-xs font-semibold text-slate-800">Connected records</p></div>
          <div className="px-3 last:pr-0"><ShieldCheck className="mb-2 h-5 w-5 text-emerald-700" /><p className="text-xs font-semibold text-slate-800">Secure workflows</p></div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[650px] lg:mx-0 lg:max-h-[calc(100svh-170px)]">
        <div className="absolute -inset-8 rounded-[36px] bg-emerald-200/30 blur-3xl" />
        <div className="relative rounded-[24px] border border-white/80 bg-white/75 p-3 shadow-[0_30px_80px_rgba(15,65,50,0.18)] backdrop-blur-sm sm:p-5">
          <div className="mb-3 flex items-center gap-1.5 px-1"><span className="h-2.5 w-2.5 rounded-full bg-red-300" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" /><span className="ml-3 h-5 flex-1 rounded-md bg-slate-100" /></div>
          <Image src="/imacplaceholder.png" alt="Avia Wellness clinic dashboard preview" width={1280} height={853} className="h-auto w-full rounded-xl" priority />
        </div>
        <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-xl sm:flex"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><CalendarCheck2 className="h-4 w-4" /></span><span><span className="block text-xs font-bold text-slate-800">Today’s clinic</span><span className="block text-[11px] text-slate-500">Everything in one view</span></span></div>
      </div>
    </div>
  </section>;
}
