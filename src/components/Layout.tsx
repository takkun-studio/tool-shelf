import { Show, UserButton } from '@clerk/react';
import { Link, NavLink } from 'react-router-dom';
import { APP_NAME } from '../constants';

export function Layout({ children }: { children: React.ReactNode }) {
  return <div className="app-shell">
    <header className="shelf-site-header">
      <Link className="brand" to="/" aria-label={`${APP_NAME} ホーム`}>{APP_NAME}</Link>
      <nav aria-label="メインナビゲーション"><NavLink to="/" end className={({ isActive }) => isActive ? 'is-active' : ''}>ツール一覧</NavLink><NavLink to="/pricing" className={({ isActive }) => isActive ? 'is-active' : ''}>料金プラン</NavLink><Show when="signed-out"><Link className="shelf-login" to="/login">ログイン <span aria-hidden="true">↗</span></Link></Show><Show when="signed-in"><Link to="/account">マイページ</Link><UserButton/></Show></nav>
    </header>
    <main id="main-content">{children}</main>
    <footer className="shelf-site-footer"><span className="shelf-footer-brand">{APP_NAME}</span><span>全10ツール無料 · 保存した試算はこのブラウザ内で管理します。</span><span>© {new Date().getFullYear()} TOOL SHELF</span></footer>
  </div>;
}
