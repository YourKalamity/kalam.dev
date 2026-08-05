export interface TextPair {
  title: string;
  subtitle: string;
}

export const kalamTextPairs: TextPair[] = [
  { title: 'Software Engineer', subtitle: 'C ✿ Python ✿ Flutter ✿ PHP ✿ Java' },
  { title: 'E2E Project Owner', subtitle: 'Shipped full-stack apps from scratch to release' },
  { title: 'Proven Track Record', subtitle: 'Delivered production-grade solutions' },
  { title: 'Computer Science Graduate', subtitle: 'First Class Honours from Aston University' },
  { title: 'Machine Learning Engineer', subtitle: 'Delivered AI and Machine Learning applications' },
  { title: 'Open Source Contributor', subtitle: 'Actively work with open source projects' },
  { title: 'CI/CD Automator', subtitle: 'Implemented CI/CD pipelines with GitHub Actions and GitLab CI/CD' },
  { title: 'Homelab Enthusiast', subtitle: 'Built and maintain a home server setup for self-hosting' },
  { title: 'Community Founder', subtitle: 'Runs a community of almost 200 people' },
];

export interface Social {
  name: string;
  href: string;
  icon: string;
}

export const socials: Social[] = [
  { name: 'GitHub', href: 'https://github.com/yourkalamity', icon: '/images/socials/github.webp' },
  { name: 'Discord', href: 'https://discord.gg/3XBcER9', icon: '/images/socials/discord.webp' },
  { name: 'Instagram', href: 'https://www.instagram.com/kalam.ty/', icon: '/images/socials/instagram.webp' },
  { name: 'Snapchat', href: 'https://www.snapchat.com/add/kalam.ity', icon: '/images/socials/snapchat.webp' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/kalamm/', icon: '/images/socials/linkedin.webp' },
  { name: 'Email', href: 'mailto:kalam@kalam.dev', icon: '/images/socials/mail.webp' },
  { name: 'Signal', href: 'https://signal.me/#eu/cl523B8WVXJCc6CDMxA2CUlRUL6prx-Pmv4cJUh2AMcLVAasqB1Lsa_X2Uodk6a2', icon: '/images/socials/signal.webp' },
];

export const sameAs = socials
  .filter((s) => ['GitHub', 'LinkedIn', 'Instagram'].includes(s.name))
  .map((s) => s.href);

export interface AppDef {
  id: string;
  title: string;
  icon: string;
  route: string;
  taskbar: boolean;
}

export const apps: AppDef[] = [
  { id: 'kalamApp', title: 'kalam.dev app', icon: '/images/kalam.webp', route: '/', taskbar: true },
  { id: 'projectsApp', title: 'Projects - File Explorer', icon: '/images/explorer.webp', route: '/projects', taskbar: true },
  { id: 'socialsApp', title: 'Socials - Windows Internet Explorer', icon: '/images/ie.webp', route: '/socials', taskbar: true },
  { id: 'terminalApp', title: 'About Me - Command Prompt', icon: '/images/icons/cmd.webp', route: '/about', taskbar: false },
];

export const SITE = {
  title: 'M Kalam | Software Engineer',
  description:
    'M Kalam, software engineer in Birmingham, UK.',
  url: 'https://www.kalam.dev',
  image: 'https://www.kalam.dev/images/preview.jpg',
  author: 'M Kalam',
};
