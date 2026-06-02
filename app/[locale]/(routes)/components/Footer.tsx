import getNextVersion from "@/actions/system/get-next-version";
import Link from "next/link";
import { version } from "@/package.json";


const Footer = async () => {
  const nextVersion = await getNextVersion();
  //console.log(nextVersion, "nextVersion");
  return (
    <footer className="flex flex-row h-10 justify-between items-center w-full text-xs text-muted-foreground px-6 py-4 border-t border-border/5">
      <div>
        <Link href="/">
          <span className="font-semibold text-muted-foreground hover:text-foreground transition-colors">
            {process.env.NEXT_PUBLIC_APP_NAME || "Flowline Pro"} - v{version}
          </span>
        </Link>
      </div>
      <div className="flex items-center space-x-1">
        <span>Powered by</span>
        <Link 
          href="https://www.algoplusit.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-bold bg-gradient-to-r from-primary to-purple-600 dark:to-teal-400 bg-clip-text text-transparent hover:underline decoration-primary/40"
        >
          Algoplus
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
