import {
  TopBar,
  Header,
  Hero,
  Features,
  Solutions,
  Pricing,
  Testimonials,
  CTA,
  Contact,
  Footer,
} from '@/components';

export default function Home() {
  return (
    <>
      <TopBar />
      <Header />
      <main>
        <Hero />
        <Features />
        <Solutions />
        <Pricing />
        <Testimonials />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
