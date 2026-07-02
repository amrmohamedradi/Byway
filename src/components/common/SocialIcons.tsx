import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

export const FacebookIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className} 
    {...props}
  >
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
  </svg>
);

export const GithubIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className} 
    {...props}
  >
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.48-10-10-10z"/>
  </svg>
);

export const TwitterIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className} 
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export const GoogleIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className} 
    {...props}
  >
    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.48 0-6.3-2.82-6.3-6.3s2.82-6.3 6.3-6.3c1.602 0 3.06.602 4.17 1.6l3.056-3.056C19.23 2.63 15.93 1.3 12.24 1.3 6.13 1.3 1.14 6.29 1.14 12.4s4.99 11.1 11.1 11.1c5.8 0 10.87-4.13 10.87-11.1 0-.74-.08-1.44-.2-2.115H12.24z"/>
  </svg>
);

export const MicrosoftIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg 
    viewBox="0 0 23 23" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className} 
    {...props}
  >
    <path d="M0 0h11v11H0z" fill="#f25022"/>
    <path d="M12 0h11v11H12z" fill="#7fba00"/>
    <path d="M0 12h11v11H0z" fill="#00a4ef"/>
    <path d="M12 12h11v11H12z" fill="#ffb900"/>
  </svg>
);

