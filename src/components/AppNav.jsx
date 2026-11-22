import React from 'react';
import { MessageSquare, Moon, Sun, HelpCircle, LayoutGrid, List, Contrast, MoreHorizontal } from 'lucide-react';
import { NAV_ITEMS } from '../constants/navigation';

const go = (id) => { window.location.hash = `#/${id}`; };

const MAIN_TABS = NAV_ITEMS.filter((i) => i.id !== 'guide');

export function AppHeader({ activeTab, sgpa, targetSgpa, theme, onToggleTheme, layout, onToggleLayout, amoled, onToggleAmoled, onFeedback }) {
  const meetsTarget = parseFloat(sgpa) >= targetSgpa;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1040px] items-center justify-between gap-3 px-4 md:px-6">
        <button type="button" onClick={() => go('subjects')} className="flex min-w-0 items-center gap-2.5 text-left" aria-label="PESU Calculator, go to Subjects">
          <img src="/header_logo.png" alt="" className="h-7 w-7 shrink-0 object-contain" />
          <span className="truncate text-[15px] font-semibold text-ink">PESU Calculator</span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="mr-2 flex items-baseline gap-1.5" title="SGPA from the marks you have entered">
            <span className="text-xs text-ink-3">SGPA</span>
            <span className={`num text-2xl font-semibold leading-none ${meetsTarget ? 'text-good' : 'text-ink'}`}>{sgpa}</span>
            <span className="num hidden text-xs text-ink-3 sm:inline">/ target {targetSgpa}</span>
          </div>
          <button
            type="button"
            onClick={() => go('guide')}
            className={`btn btn-ghost btn-sm !px-2 hidden sm:inline-flex lg:hidden ${activeTab === 'guide' ? '!bg-raised !text-ink' : ''}`}
            aria-label="Guide"
            title="Guide"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>
          {activeTab === 'subjects' && onToggleLayout && (
            <button
              type="button"
              onClick={onToggleLayout}
              className="btn btn-ghost btn-sm !px-2"
              aria-label={layout === 'cards' ? 'Switch to classic layout' : 'Switch to card layout'}
              title={layout === 'cards' ? 'Switch to classic layout' : 'Switch to card layout'}
            >
              {layout === 'cards' ? <List className="h-[18px] w-[18px]" /> : <LayoutGrid className="h-[18px] w-[18px]" />}
            </button>
          )}
          {theme === 'dark' && onToggleAmoled && (
            <button
              type="button"
              onClick={onToggleAmoled}
              aria-pressed={!!amoled}
              className={`btn btn-ghost btn-sm !px-2 hidden sm:inline-flex ${amoled ? '!bg-raised !text-ink' : ''}`}
              aria-label={amoled ? 'Turn off pure black (AMOLED)' : 'Turn on pure black (AMOLED)'}
              title={amoled ? 'Pure black: on' : 'Pure black (AMOLED)'}
            >
              <Contrast className="h-[18px] w-[18px]" />
            </button>
          )}
          <button type="button" onClick={onToggleTheme} className="btn btn-ghost btn-sm !px-2" aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title="Switch theme">
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <button type="button" onClick={onFeedback} className="btn btn-ghost btn-sm !px-2" aria-label="Send feedback" title="Send feedback">
            <MessageSquare className="h-[18px] w-[18px]" />
          </button>

          {/* Phones: Guide and pure black live in one menu so the title has room */}
          <details className="relative sm:hidden">
            <summary className="btn btn-ghost btn-sm !px-2 cursor-pointer" aria-label="More options" title="More">
              <MoreHorizontal className="h-[18px] w-[18px]" />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-line bg-surface p-1.5 shadow-lg">
              <button
                type="button"
                onClick={(e) => { e.currentTarget.closest('details')?.removeAttribute('open'); go('guide'); }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-ink hover:bg-raised"
              >
                <HelpCircle className="h-4 w-4 text-ink-3" /> Guide
              </button>
              {theme === 'dark' && onToggleAmoled && (
                <button
                  type="button"
                  onClick={(e) => { e.currentTarget.closest('details')?.removeAttribute('open'); onToggleAmoled(); }}
                  aria-pressed={!!amoled}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-ink hover:bg-raised"
                >
                  <Contrast className="h-4 w-4 text-ink-3" /> Pure black
                  <span className="ml-auto text-xs text-ink-3">{amoled ? 'On' : 'Off'}</span>
                </button>
              )}
            </div>
          </details>
        </div>
      </div>

      {/* Desktop tab strip: every page is always one click away */}
      <nav aria-label="Pages" className="hidden border-t border-line lg:block">
        <div className="mx-auto flex max-w-[1040px] items-stretch px-6">
          {MAIN_TABS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${active
                  ? 'border-accent text-ink'
                  : 'border-transparent text-ink-3 hover:text-ink'}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => go('guide')}
            aria-current={activeTab === 'guide' ? 'page' : undefined}
            className={`-mb-px ml-auto flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'guide'
              ? 'border-accent text-ink'
              : 'border-transparent text-ink-3 hover:text-ink'}`}
          >
            <HelpCircle className="h-4 w-4" />
            Guide
          </button>
        </div>
      </nav>
    </header>
  );
}

export function MobileNav({ activeTab }) {
  return (
    <nav
      aria-label="Pages"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-canvas lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {MAIN_TABS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] font-medium transition-colors ${active ? 'text-accent' : 'text-ink-3 active:text-ink'}`}
            >
              {active && <span className="absolute inset-x-3 top-0 h-0.5 rounded-b bg-accent" />}
              <item.icon className="h-5 w-5" />
              <span className="max-w-full truncate">{item.short}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
