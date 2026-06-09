import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Variant = 'info' | 'warning' | 'danger' | 'success';

interface DialogOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
}

interface DialogContextValue {
  alert: (message: string, opts?: DialogOptions) => Promise<void>;
  confirm: (message: string, opts?: DialogOptions) => Promise<boolean>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used inside <DialogProvider>');
  return ctx;
}

// ─── Internal modal state ─────────────────────────────────────────────────────
interface ModalState extends DialogOptions {
  open: boolean;
  isAlert: boolean;
  message: string;
}

const CLOSED: ModalState = { open: false, isAlert: false, message: '' };

// ─── Styling maps ─────────────────────────────────────────────────────────────
const ICON_BG: Record<Variant, string> = {
  danger:  'bg-red-100',
  success: 'bg-green-100',
  warning: 'bg-amber-100',
  info:    'bg-[#0d9488]/10',
};

const ICON_EL: Record<Variant, React.ReactNode> = {
  danger:  <Trash2       size={24} className="text-red-500"      />,
  success: <CheckCircle  size={24} className="text-green-500"    />,
  warning: <AlertTriangle size={24} className="text-amber-500"   />,
  info:    <Info          size={24} className="text-[#0d9488]"   />,
};

const BTN_CLS: Record<Variant, string> = {
  danger:  'bg-red-500   hover:bg-red-600   shadow-[0_4px_16px_rgba(239,68,68,0.4)]',
  success: 'bg-green-500 hover:bg-green-600 shadow-[0_4px_16px_rgba(34,197,94,0.4)]',
  warning: 'bg-[#0d9488] hover:bg-[#0f766e] shadow-[0_4px_16px_rgba(13,148,136,0.4)]',
  info:    'bg-[#0d9488] hover:bg-[#0f766e] shadow-[0_4px_16px_rgba(13,148,136,0.4)]',
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DialogProvider({ children }: { children: ReactNode }) {
  const [state,   setState]   = useState<ModalState>(CLOSED);
  const [visible, setVisible] = useState(false);
  const resolveRef = useRef<(v: boolean) => void>(() => {});

  // Trigger entrance animation after mount
  useEffect(() => {
    if (state.open) requestAnimationFrame(() => setVisible(true));
  }, [state.open]);

  const openDialog = useCallback(
    (s: Omit<ModalState, 'open'>): Promise<boolean> =>
      new Promise((resolve) => {
        resolveRef.current = resolve;
        setState({ ...s, open: true });
      }),
    [],
  );

  const alert = useCallback(
    (message: string, opts?: DialogOptions): Promise<void> =>
      openDialog({
        isAlert: true,
        message,
        title:       opts?.title       ?? '',
        confirmText: opts?.confirmText ?? 'OK',
        variant:     opts?.variant     ?? 'info',
      }).then(() => {}),
    [openDialog],
  );

  const confirm = useCallback(
    (message: string, opts?: DialogOptions): Promise<boolean> =>
      openDialog({
        isAlert: false,
        message,
        title:       opts?.title       ?? '',
        confirmText: opts?.confirmText ?? 'Confirm',
        cancelText:  opts?.cancelText  ?? 'Cancel',
        variant:     opts?.variant     ?? 'warning',
      }),
    [openDialog],
  );

  // Override window.alert so any legacy / library calls also use the custom UI
  useEffect(() => {
    const orig = window.alert.bind(window);
    window.alert = (msg?: unknown) => { alert(String(msg ?? '')); };
    return () => { window.alert = orig; };
  }, [alert]);

  const resolve = useCallback((value: boolean) => {
    setVisible(false);
    setTimeout(() => {
      setState(CLOSED);
      resolveRef.current(value);
    }, 180);
  }, []);

  const v = (state.variant ?? 'info') as Variant;

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}

      {/* ── Modal ── */}
      {state.open && (
        <div
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-4
            transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0f172a]/65 backdrop-blur-[3px]"
            onClick={state.isAlert ? () => resolve(true) : undefined}
          />

          {/* Card */}
          <div
            className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-sm px-7 py-8
              transition-all duration-200 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          >
            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${ICON_BG[v]}`}>
              {ICON_EL[v]}
            </div>

            {/* Title */}
            {state.title && (
              <h3 className="text-base font-bold text-[#0f172a] text-center mb-1.5">
                {state.title}
              </h3>
            )}

            {/* Message */}
            <p className="text-[#64748b] text-center text-sm leading-relaxed mb-8">
              {state.message}
            </p>

            {/* Buttons */}
            <div className={`flex gap-3 ${state.isAlert ? 'justify-center' : ''}`}>
              {!state.isAlert && (
                <button
                  onClick={() => resolve(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-[#64748b]
                    font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  {state.cancelText ?? 'Cancel'}
                </button>
              )}
              <button
                onClick={() => resolve(true)}
                className={`${state.isAlert ? 'px-12' : 'flex-1'} py-3 rounded-xl text-white
                  font-semibold text-sm transition-all hover:-translate-y-0.5 ${BTN_CLS[v]}`}
              >
                {state.confirmText ?? 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
