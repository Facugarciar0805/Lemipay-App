import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "About LemiPay — Shared Treasury Infrastructure",
  description:
    "Learn about LemiPay's vision for programmable shared funds built on Stellar.",
};

function AboutHeader() {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/images/lemipay-logo.jpeg"
            alt="LemiPay"
            className="h-9 w-9 rounded-lg"
          />
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Lemi<span className="gradient-text">pay</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Home
        </Link>
      </div>
    </header>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {children}
        </div>
      </div>
    </section>
  );
}

const roadmapSteps = [
  { label: "MVP Testnet", status: "current" },
  { label: "Stablecoin Mainnet", status: "next" },
  { label: "Mobile", status: "later" },
  { label: "Fiat ramps", status: "later" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <AboutHeader />
      <main>
        <section className="border-b border-border/30 py-20 md:py-28">
          <div className="container mx-auto max-w-3xl px-4 md:px-6 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              About LemiPay
            </h1>
            <p className="mt-4 text-muted-foreground">
              Philosophy, positioning, and infrastructure.
            </p>
          </div>
        </section>

        <Section title="Why LemiPay Exists">
          <p>
            Shared money is socially fragile. When friends, housemates, or
            project teams pool funds informally, trust carries the whole system.
            One person holds the wallet or the spreadsheet; everyone else
            depends on that person&apos;s honesty and availability. Under pressure—disputes,
            exit, or simple forgetfulness—these arrangements break.
          </p>
          <p>
            Traditional apps help with the math: they calculate who owes whom.
            They do not enforce coordination. Debts are tracked; execution is
            still manual and opaque. LemiPay exists to introduce programmable
            shared treasury logic: rules defined upfront, funds on-chain,
            execution transparent and deterministic.
          </p>
        </Section>

        <Section title="Programmable Shared Funds">
          <p>
            In LemiPay, funds are deposited into a shared on-chain treasury.
            Rules are defined upfront: who can propose spending, how many
            approvals are required, which assets are allowed. No single party has
            unilateral control. There is no hidden ledger and no informal
            treasurer—the contract is the source of truth.
          </p>
          <p>
            Every deposit, proposal, and approval is visible and verifiable.
            Outcomes are deterministic: if the rules are met, the contract
            executes. This shifts coordination from social guesswork to
            programmable infrastructure.
          </p>
        </Section>

        <Section title="Where We Sit">
          <p>
            LemiPay sits at the intersection of bill-splitting apps, social
            payment apps, multi-sig wallets, and Web3 coordination tools.
          </p>
          <p>
            Other apps calculate who owes what. Venmo and similar apps
            socialize payments between individuals. Gnosis Safe and other
            multi-sigs secure shared custody. LemiPay focuses on coordination:
            temporary or ongoing shared funds with clear rules, transparent
            proposals, and on-chain execution. We complement rather than replace
            these tools—we add programmable group logic for shared treasuries.
          </p>
        </Section>

        <Section title="Built on Stellar">
          <p>
            We build on Stellar for infrastructure optimized for money movement:
            fast finality (typically 3–5 seconds), extremely low fees, and a
            stablecoin-native ecosystem. Stellar is designed for real-world
            payments and settlements, not DeFi complexity.
          </p>
          <p>
            Soroban smart contracts give us programmable treasury logic without
            sacrificing speed or cost. We chose infrastructure that fits
            collective spending and real-world use, not speculation-first
            chains.
          </p>
        </Section>

        <Section title="Who We Start With">
          <p>
            Our early focus is Web3-native communities: hackathon teams, small
            DAOs, coliving groups, and project-based collectives. These users
            already have wallets, are comfortable with smart contracts, and
            frequently need temporary or recurring shared funds.
          </p>
          <p>
            They also need coordination that scales—proposals, approvals, and
            execution without a single point of failure. Starting here lets us
            refine the product with users who understand the stack, then expand
            to broader audiences as onboarding and tooling improve.
          </p>
        </Section>

        <Section title="Social Finance Infrastructure">
          <p>
            Long term, we see shared treasuries as a primitive: a standard way
            for groups to hold and spend money together with programmable
            rules. That primitive can underpin everything from event budgets and
            travel pools to ongoing DAO operations and community funds.
          </p>
          <p>
            We are building infrastructure for collective spending—transparent,
            rule-based, and chain-native. The goal is to expand from Web3-native
            early adopters to mainstream users as wallets and fiat ramps
            improve, so that programmable group coordination becomes a normal
            part of how people manage shared money.
          </p>
        </Section>

        <section className="border-t border-border/30 py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Roadmap
            </h2>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
              {roadmapSteps.map(({ label, status }) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      status === "current"
                        ? "bg-primary"
                        : "bg-muted-foreground/50"
                    }`}
                    aria-hidden
                  />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
