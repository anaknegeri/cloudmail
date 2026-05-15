import { useState } from "react";
import Icon from "../components/Icon";
import { login, register } from "../request/login";
import { loginUserInfo } from "../request/my";
import { useAccountStore } from "../store/account";
import { useSettingStore } from "../store/setting";
import { useUserStore } from "../store/user";

interface LoginProps {
  onEnter: () => void;
}

export default function Login({ onEnter }: LoginProps) {
  const settings = useSettingStore((s) => s.settings);
  const domainList = useSettingStore((s) => s.domainList);
  // register === 0 means enabled (same convention as mail-vue)
  const registerEnabled = settings.register === 0;
  const [tab, setTab] = useState<"login" | "register">("login");
  // If register gets disabled while on register tab, force back to login
  const activeTab = tab === "register" && !registerEnabled ? "login" : tab;

  // ── Login form ──
  const [email, setEmail] = useState("");
  const [suffix, setSuffix] = useState(domainList[0] ?? "");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // ── Register form ──
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regCode, setRegCode] = useState("");
  const [registerLoading, setRegLoading] = useState(false);
  const [registerError, setRegError] = useState("");

  const hideLoginDomain =
    domainList.length === 0 || (domainList.length === 1 && !!suffix);

  // ── Helpers ──
  function fullEmail(localPart: string) {
    if (!suffix || localPart.includes("@")) return localPart;
    return localPart + suffix;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await login(fullEmail(email), password);
      localStorage.setItem("token", res?.token ?? res);
      // Fetch user info after login
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user: any = await loginUserInfo();
      useUserStore.getState().setUser(user);
      useAccountStore
        .getState()
        .setAccount(user.account.accountId, user.account);
      onEnter();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setLoginError(e?.message ?? "Login failed");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    if (regPassword !== regConfirm) {
      setRegError("Passwords do not match");
      return;
    }
    setRegLoading(true);
    try {
      await register({
        email: fullEmail(regEmail),
        password: regPassword,
        confirmPassword: regConfirm,
        code: regCode || undefined,
      });
      // Auto-login after register
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await login(fullEmail(regEmail), regPassword);
      localStorage.setItem("token", res?.token ?? res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user: any = await loginUserInfo();
      useUserStore.getState().setUser(user);
      useAccountStore
        .getState()
        .setAccount(user.account.accountId, user.account);
      onEnter();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setRegError(e?.message ?? "Registration failed");
    } finally {
      setRegLoading(false);
    }
  }

  // ── Styles ──
  const inputStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1.5px solid var(--line)",
    color: "var(--ink)",
    outline: "none",
  };

  return (
    <div
      className="h-screen grid grid-cols-2"
      style={{ background: "var(--bg)" }}
    >
      {/* Art panel */}
      <div
        className="relative overflow-hidden flex flex-col justify-center p-10"
        style={{
          background:
            "linear-gradient(135deg, var(--accent-soft) 0%, var(--peach-soft) 50%, var(--lavender-soft) 100%)",
        }}
      >
        <div
          className="cloud-deco"
          style={{ width: 180, height: 60, top: 80, left: -40 }}
        />
        <div
          className="cloud-deco"
          style={{ width: 120, height: 40, top: 200, right: 60, opacity: 0.45 }}
        />
        <div
          className="cloud-deco"
          style={{ width: 200, height: 70, bottom: 140, right: -40 }}
        />
        <div
          className="cloud-deco"
          style={{ width: 90, height: 32, top: 320, left: 80, opacity: 0.5 }}
        />

        <div className="flex items-center gap-2.5 z-10 mb-8">
          <div
            className="brand-mark w-8 h-8 rounded-[10px] grid place-items-center relative flex-shrink-0 shadow-1"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, var(--lavender) 100%)",
            }}
          />
          <div className="font-serif text-[26px] font-medium tracking-tight">
            {settings.title ?? "Cloud"}
            <em className="not-italic" style={{ color: "var(--accent)" }}>
              mail
            </em>
          </div>
        </div>

        <div className="z-10 max-w-[440px]">
          <h1
            className="font-serif font-normal leading-[1.05] tracking-[-0.025em] mb-4 mt-0"
            style={{ fontSize: 56, color: "var(--ink)" }}
          >
            Email{" "}
            <em
              className="font-serif"
              style={{ fontStyle: "italic", color: "var(--accent)" }}
            >
              that lets you
            </em>{" "}
            breathe.
          </h1>
          <p
            className="text-base leading-[1.55] m-0"
            style={{ color: "var(--ink-2)" }}
          >
            CloudMail is a calmer inbox — soft on the eyes, sharp on the things
            that matter, and quiet about the rest.
          </p>
        </div>



      </div>

      {/* Form panel */}
      <div
        className="grid place-items-center p-10 overflow-y-auto"
        style={{ background: "var(--bg)" }}
      >
        <div className="w-full max-w-[380px]">
          {/* Tabs — only render when registration is enabled */}
          {registerEnabled && (
            <div
              className="flex gap-1 p-1 rounded-[12px] mb-6"
              style={{ background: "var(--surface)" }}
            >
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setLoginError("");
                    setRegError("");
                  }}
                  className="flex-1 py-2 rounded-[9px] text-[13.5px] font-semibold capitalize transition-colors"
                  style={{
                    background: activeTab === t ? "var(--bg)" : "transparent",
                    color: activeTab === t ? "var(--ink)" : "var(--ink-3)",
                    boxShadow: activeTab === t ? "var(--shadow-1)" : "none",
                  }}
                >
                  {t === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>
          )}

          {activeTab === "login" ? (
            <form onSubmit={handleLogin}>
              <h2
                className="font-serif font-medium tracking-[-0.02em] m-0 mb-1.5"
                style={{ fontSize: 30, color: "var(--ink)" }}
              >
                Welcome back.
              </h2>
              <p
                className="text-[14px] m-0 mb-5"
                style={{ color: "var(--ink-3)" }}
              >
                Sign in to your CloudMail account.
              </p>

              {/* Email + domain suffix */}
              <div
                className="flex mb-2.5 rounded-[12px] overflow-hidden"
                style={{ border: "1.5px solid var(--line)" }}
              >
                <input
                  className="flex-1 px-4 py-[14px] text-[14.5px]"
                  style={{ ...inputStyle, border: "none" }}
                  placeholder="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
                {!hideLoginDomain && (
                  <select
                    className="px-3 text-[13px] border-l"
                    style={{
                      ...inputStyle,
                      border: "none",
                      borderLeft: "1.5px solid var(--line)",
                    }}
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                  >
                    {domainList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <input
                type="password"
                className="block w-full px-4 py-[14px] rounded-[12px] text-[14.5px] mb-4"
                style={inputStyle}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              {loginError && (
                <div
                  className="text-[13px] mb-3 px-3 py-2 rounded-[8px]"
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                  }}
                >
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="flex items-center justify-center gap-1.5 w-full py-[14px] px-5 rounded-[10px] font-semibold text-[14.5px] transition-all"
                style={{
                  background: loginLoading ? "var(--ink-3)" : "var(--ink)",
                  color: "var(--surface)",
                  cursor: loginLoading ? "not-allowed" : "pointer",
                }}
              >
                {loginLoading ? (
                  "Signing in…"
                ) : (
                  <>
                    Sign in <Icon name="arrow-right" size={15} />
                  </>
                )}
              </button>

              {/* LinuxDo OAuth */}
              {settings.linuxdoSwitch && (
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 w-full py-3 mt-2.5 rounded-[10px] font-semibold text-[13.5px] transition-colors"
                  style={{
                    background: "var(--surface)",
                    border: "1.5px solid var(--line)",
                    color: "var(--ink)",
                  }}
                  onClick={() => {
                    // OAuth redirect — handled by backend
                    window.location.href = "/oauth/linuxdo";
                  }}
                >
                  <img
                    src="/image/linuxdo.webp"
                    alt="LinuxDo"
                    className="w-4 h-4 rounded-full"
                  />
                  LinuxDo
                </button>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h2
                className="font-serif font-medium tracking-[-0.02em] m-0 mb-1.5"
                style={{ fontSize: 30, color: "var(--ink)" }}
              >
                Get started.
              </h2>
              <p
                className="text-[14px] m-0 mb-5"
                style={{ color: "var(--ink-3)" }}
              >
                Create your CloudMail account.
              </p>

              <div
                className="flex mb-2.5 rounded-[12px] overflow-hidden"
                style={{ border: "1.5px solid var(--line)" }}
              >
                <input
                  className="flex-1 px-4 py-[14px] text-[14.5px]"
                  style={{ ...inputStyle, border: "none" }}
                  placeholder="username"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
                {!hideLoginDomain && (
                  <select
                    className="px-3 text-[13px]"
                    style={{
                      ...inputStyle,
                      border: "none",
                      borderLeft: "1.5px solid var(--line)",
                    }}
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                  >
                    {domainList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <input
                type="password"
                className="block w-full px-4 py-[14px] rounded-[12px] text-[14.5px] mb-2.5"
                style={inputStyle}
                placeholder="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <input
                type="password"
                className="block w-full px-4 py-[14px] rounded-[12px] text-[14.5px] mb-2.5"
                style={inputStyle}
                placeholder="Confirm password"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
              {/* Reg key / invite code */}
              {(settings.regKey === 0 || settings.regKey === 2) && (
                <input
                  className="block w-full px-4 py-[14px] rounded-[12px] text-[14.5px] mb-2.5"
                  style={inputStyle}
                  placeholder={
                    settings.regKey === 2
                      ? "Invite code (optional)"
                      : "Invite code"
                  }
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value)}
                  required={settings.regKey === 0}
                />
              )}

              {registerError && (
                <div
                  className="text-[13px] mb-3 px-3 py-2 rounded-[8px]"
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                  }}
                >
                  {registerError}
                </div>
              )}

              <button
                type="submit"
                disabled={registerLoading}
                className="flex items-center justify-center gap-1.5 w-full py-[14px] px-5 rounded-[10px] font-semibold text-[14.5px] transition-all"
                style={{
                  background: registerLoading ? "var(--ink-3)" : "var(--ink)",
                  color: "var(--surface)",
                  cursor: registerLoading ? "not-allowed" : "pointer",
                }}
              >
                {registerLoading ? (
                  "Creating account…"
                ) : (
                  <>
                    Create account <Icon name="arrow-right" size={15} />
                  </>
                )}
              </button>

              {settings.linuxdoSwitch && (
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 w-full py-3 mt-2.5 rounded-[10px] font-semibold text-[13.5px] transition-colors"
                  style={{
                    background: "var(--surface)",
                    border: "1.5px solid var(--line)",
                    color: "var(--ink)",
                  }}
                  onClick={() => {
                    window.location.href = "/oauth/linuxdo";
                  }}
                >
                  <img
                    src="/image/linuxdo.webp"
                    alt="LinuxDo"
                    className="w-4 h-4 rounded-full"
                  />
                  LinuxDo
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
