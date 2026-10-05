import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <main id="main" className="not-found-page">
      <header>
        <Brand />
        <Link href="/" className="not-found-home">
          <ArrowLeft size={14} /> Home
        </Link>
      </header>
      <section className="not-found-content">
        <div className="not-found-orbit" aria-hidden="true">
          <span>404</span>
          <i />
          <i />
          <i />
        </div>
        <div>
          <p className="eyebrow">404 / OFF THE GRID</p>
          <h1>This page isn’t here.</h1>
          <p>That address doesn’t resolve to a published LogicSphere page.</p>
          <Link href="/contact" className="button">
            Talk with our team <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <footer>
        <span>LOGICSPHERE INC</span>
        <span>ROUTE / NOT FOUND</span>
      </footer>
    </main>
  );
}
