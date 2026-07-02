(() => {
  "use strict";

  const form = document.getElementById("wizardForm");
  const steps = Array.from(form.querySelectorAll(".step"));
  const indicators = Array.from(document.querySelectorAll("[data-step-indicator]"));
  const backBtn = form.querySelector('[data-action="back"]');
  const nextBtn = form.querySelector('[data-action="next"]');
  const submitBtn = form.querySelector('[data-action="submit"]');
  const nav = form.querySelector("[data-nav]");
  const success = form.querySelector("[data-success]");

  const totalSteps = steps.length;
  let currentStep = 1;

  /* ---------- Validation rules per step ---------- */
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validators = {
    1() {
      const nameOk = validateField(
        "fullName",
        (v) => v.trim().length >= 2,
        "Please enter your full name."
      );
      const emailOk = validateField(
        "email",
        (v) => emailPattern.test(v.trim()),
        "Please enter a valid email address."
      );
      return nameOk && emailOk;
    },
    2() {
      const userOk = validateField(
        "username",
        (v) => v.trim().length >= 3,
        "Username must be at least 3 characters."
      );
      const passOk = validateField(
        "password",
        (v) => v.length >= 8,
        "Password must be at least 8 characters."
      );
      const confirmOk = validateField(
        "confirmPassword",
        (v) => v.length > 0 && v === form.elements.password.value,
        "Passwords do not match."
      );
      return userOk && passOk && confirmOk;
    },
    3() {
      const planChosen = Boolean(form.elements.plan.value);
      setError("plan", planChosen ? "" : "Please select a plan.");
      const group = document.querySelector(".plans");
      if (group) {
        group.setAttribute("aria-invalid", planChosen ? "false" : "true");
      }
      return planChosen;
    },
    4() {
      return true;
    },
  };

  /* ---------- Field helpers ---------- */
  function validateField(name, test, message) {
    const input = form.elements[name];
    const valid = test(input.value);
    input.setAttribute("aria-invalid", valid ? "false" : "true");
    setError(name, valid ? "" : message);
    return valid;
  }

  function setError(name, message) {
    const errorEl = document.getElementById(`${name}-error`);
    if (errorEl) {
      errorEl.textContent = message;
    }
  }

  function clearFieldError(input) {
    input.setAttribute("aria-invalid", "false");
    setError(input.name, "");
  }

  /* ---------- Step navigation ---------- */
  function showStep(step) {
    steps.forEach((el) => {
      el.hidden = Number(el.dataset.step) !== step;
    });

    indicators.forEach((el) => {
      const n = Number(el.dataset.stepIndicator);
      el.classList.toggle("is-complete", n < step);
      if (n === step) {
        el.setAttribute("aria-current", "step");
      } else {
        el.removeAttribute("aria-current");
      }
    });

    backBtn.disabled = step === 1;

    const onLastStep = step === totalSteps;
    nextBtn.hidden = onLastStep;
    submitBtn.hidden = !onLastStep;

    focusStep(step);
  }

  function focusStep(step) {
    const active = steps.find((el) => Number(el.dataset.step) === step);
    if (!active) return;
    const target = active.querySelector("input, [tabindex]");
    if (target) {
      target.focus({ preventScroll: true });
    }
  }

  function goNext() {
    if (!validators[currentStep]()) {
      focusFirstInvalid();
      return;
    }
    if (currentStep === totalSteps - 1) {
      populateReview();
    }
    if (currentStep < totalSteps) {
      currentStep += 1;
      showStep(currentStep);
    }
  }

  function goBack() {
    if (currentStep > 1) {
      currentStep -= 1;
      showStep(currentStep);
    }
  }

  function focusFirstInvalid() {
    const invalid = steps
      .find((el) => Number(el.dataset.step) === currentStep)
      .querySelector('[aria-invalid="true"]');
    if (invalid && typeof invalid.focus === "function") {
      invalid.focus();
    }
  }

  /* ---------- Review ---------- */
  function populateReview() {
    const data = {
      fullName: form.elements.fullName.value.trim(),
      email: form.elements.email.value.trim(),
      username: form.elements.username.value.trim(),
      password: "•".repeat(form.elements.password.value.length),
      plan: form.elements.plan.value,
      newsletter: form.elements.newsletter.checked ? "Subscribed" : "No thanks",
    };

    Object.entries(data).forEach(([key, value]) => {
      const cell = form.querySelector(`[data-review="${key}"]`);
      if (cell) {
        cell.textContent = value || "—";
      }
    });
  }

  /* ---------- Submit / reset ---------- */
  function handleSubmit(event) {
    event.preventDefault();
    for (let s = 1; s <= totalSteps; s += 1) {
      if (!validators[s]()) {
        currentStep = s;
        showStep(currentStep);
        focusFirstInvalid();
        return;
      }
    }
    showSuccess();
  }

  function showSuccess() {
    steps.forEach((el) => (el.hidden = true));
    nav.hidden = true;
    document.querySelector(".steps").hidden = true;
    success.hidden = false;
    success.querySelector(".btn").focus();
  }

  function restart() {
    form.reset();
    steps.forEach((el) => {
      el.querySelectorAll("[aria-invalid]").forEach((input) =>
        input.setAttribute("aria-invalid", "false")
      );
      el.querySelectorAll(".field__error").forEach((p) => (p.textContent = ""));
    });
    success.hidden = true;
    nav.hidden = false;
    document.querySelector(".steps").hidden = false;
    currentStep = 1;
    showStep(currentStep);
  }

  /* ---------- Events ---------- */
  nextBtn.addEventListener("click", goNext);
  backBtn.addEventListener("click", goBack);
  form.addEventListener("submit", handleSubmit);

  form.querySelector('[data-action="restart"]').addEventListener("click", restart);

  // Clear errors as the user corrects fields.
  form.addEventListener("input", (event) => {
    const target = event.target;
    if (target.matches(".field__input")) {
      clearFieldError(target);
    }
    if (target.name === "plan") {
      setError("plan", "");
      const group = document.querySelector(".plans");
      if (group) group.setAttribute("aria-invalid", "false");
    }
  });

  // Allow Enter to advance instead of submitting mid-wizard.
  form.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.matches(".field__input")) {
      if (currentStep < totalSteps) {
        event.preventDefault();
        goNext();
      }
    }
  });

  showStep(currentStep);
})();
