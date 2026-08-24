(() => {
  "use strict";

  const form = document.querySelector("[data-home-diagnosis-form]");
  if (!form) return;

  const input = form.querySelector("[data-home-diagnosis-url]");
  const button = form.querySelector("[data-home-diagnosis-submit]");
  const status = form.querySelector("[data-home-diagnosis-status]");

  const normalizeUrl = (raw) => {
    const value = String(raw || "").trim();
    if (!value) return "";
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const url = normalizeUrl(input?.value);
    if (!url) {
      status.textContent = "진단할 사이트 주소를 입력해 주세요.";
      status.classList.add("is-error");
      input?.focus();
      return;
    }

    try {
      new URL(url);
    } catch {
      status.textContent = "사이트 주소 형식을 확인해 주세요.";
      status.classList.add("is-error");
      input?.focus();
      return;
    }

    if (input) input.value = url;
    form.classList.add("is-loading");
    status.classList.remove("is-error");
    status.textContent = "주소를 확인하고 진단 작업을 준비하고 있습니다.";
    if (button) button.disabled = true;

    const analytics = window.SF_ANALYTICS;
    try {
      await analytics?.event?.("diagnosis_started", { url });
      if (!analytics?.API) {
        location.href = `/diagnosis/?url=${encodeURIComponent(url)}`;
        return;
      }

      const response = await fetch(`${analytics.API}/api/v1/diagnoses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...analytics.touch, url })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "진단을 시작하지 못했습니다.");
      location.href = `/diagnosis/result/?id=${encodeURIComponent(body.diagnosisId)}`;
    } catch (error) {
      form.classList.remove("is-loading");
      if (button) button.disabled = false;
      status.classList.add("is-error");
      status.textContent = error?.message || "진단을 시작하지 못했습니다.";
    }
  });
})();
