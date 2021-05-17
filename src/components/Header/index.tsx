import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={`${styles.headerContainer} ${styles.headerContent}`}>
      <Link href="/">
        <a>
          <img src="/Logo.svg" alt="logo" className={`${styles.logoHeader}`} />
        </a>
      </Link>
    </header>
  );
}
