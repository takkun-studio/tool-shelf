import { ClerkProvider } from '@clerk/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { tools } from './tools';
import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { Login } from './pages/Login';
import { Account } from './pages/Account';
import { ToolPage } from './pages/ToolPage';
import './styles.css';
import './sales.css';
import './auth.css';
import './redesign.css';

function NotFound() {
  return <section className="notfound"><h1>ページが見つかりません</h1><a href="/">ホームへ戻る</a></section>;
}

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const app = <BrowserRouter><Layout><Routes>
  <Route path="/" element={<Home/>}/>
  <Route path="/pricing" element={<Pricing/>}/>
  <Route path="/login" element={<Login/>}/>
  <Route path="/account" element={<Account/>}/>
  {tools.map((tool) => <Route key={tool.id} path={tool.route} element={<ToolPage id={tool.id}/>}/>)}
  <Route path="*" element={<NotFound/>}/>
</Routes></Layout></BrowserRouter>;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {publishableKey
      ? <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">{app}</ClerkProvider>
      : <main className="notfound"><h1>認証未設定です</h1><p>VITE_CLERK_PUBLISHABLE_KEYを設定してください。</p></main>}
  </StrictMode>,
);
