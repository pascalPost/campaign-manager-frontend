export function Footer() {
  return (
    <footer className="hidden w-full justify-between border-t px-6 py-1 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:flex">
      <div>
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by Pascal Post. The source code is available on{" "}
          <a
            href="https://github.com/pascalPost/campaign-manager"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
      </div>
      <div className="text-sm text-muted-foreground ">
        {/* TODO show this in sidebar on mobile */}
        {/* TODO link to a page listing changelog */}
        v0.1.0
      </div>
    </footer>
  );
}
