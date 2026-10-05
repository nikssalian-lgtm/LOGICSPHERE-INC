import Link from "next/link";
export function Brand({ header = false }: { header?: boolean }) {
  if (header) {
    return (
      <Link href="/" className="header-brand" aria-label="LogicSphere Inc home">
        <img
          className="header-logo-light"
          src="/brand/logicsphere-header-light.svg"
          alt=""
          width="572"
          height="128"
        />
        <img
          className="header-logo-dark"
          src="/brand/logicsphere-header-dark.svg"
          alt=""
          width="572"
          height="128"
        />
      </Link>
    );
  }
  return (
    <Link href="/" className="brand" aria-label="LogicSphere Inc home">
      <span className="brand-crop">
        <img
          src="/brand/logicsphere-original.svg"
          alt="LogicSphere Inc"
          width="792"
          height="612"
        />
      </span>
    </Link>
  );
}
