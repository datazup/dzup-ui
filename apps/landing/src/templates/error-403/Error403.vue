<script setup lang="ts">
/**
 * 403 — Access Denied — Utility template (docs/templates.md §6.3).
 *
 * A chromeless, centered error page mirroring the shipped 404: a brand lockup, an
 * oversized "403" glyph, a DzResult (status warning) headline, a DzAlert spelling
 * out the missing permission, and recovery actions (request access / sign in as a
 * different user). Requesting access flips the alert to a client-side "request
 * sent" success state. Leans on the warning palette to read as "blocked, not
 * broken" — distinct from the danger-toned 500 beside it in Utility.
 *
 * Built only from free `@dzup-ui/core` components, token-styled, light + dark,
 * reflows cleanly 390px → up.
 */
import { DzAlert, DzButton, DzCard, DzResult, DzText } from '@dzup-ui/core'
import { Boxes, LockKeyhole, LogIn, ShieldCheck } from 'lucide-vue-next'
import { ref } from 'vue'

/** The signed-in identity and the resource they tried to reach — realistic detail. */
const ACCOUNT = 'casey.morgan@northwind.io'
const RESOURCE = 'Billing & invoices'
const REQUIRED_ROLE = 'Workspace admin'

/** Client-side request-access state, so the page actually does something. */
const requested = ref(false)
function requestAccess(): void {
  requested.value = true
}
</script>

<template>
  <main class="err-page">
    <div class="err-wrap">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
        <span class="brand-name">Northwind</span>
      </span>

      <p class="err-code" aria-hidden="true">
        403
      </p>

      <DzResult
        status="warning"
        title="You don’t have access to this page"
        :description="`“${RESOURCE}” is restricted. Your account doesn’t have the permission required to view it.`"
      >
        <template #actions>
          <DzButton
            variant="solid"
            tone="primary"
            :disabled="requested"
            @click="requestAccess"
          >
            <template #prefix>
              <ShieldCheck :size="16" aria-hidden="true" />
            </template>
            {{ requested ? 'Request sent' : 'Request access' }}
          </DzButton>
          <DzButton variant="outline" tone="neutral" href="#">
            <template #prefix>
              <LogIn :size="16" aria-hidden="true" />
            </template>
            Use a different account
          </DzButton>
        </template>
      </DzResult>

      <DzAlert
        v-if="!requested"
        tone="warning"
        variant="subtle"
        title="Permission required"
        class="err-alert"
      >
        Viewing this page needs the <strong>{{ REQUIRED_ROLE }}</strong> role. Ask a
        workspace owner to grant it, or request access and we’ll notify them for you.
      </DzAlert>
      <DzAlert
        v-else
        tone="success"
        variant="subtle"
        title="Access requested"
        class="err-alert"
      >
        We’ve let your workspace admins know you need access to
        <strong>{{ RESOURCE }}</strong>. You’ll get an email the moment it’s approved.
      </DzAlert>

      <DzCard variant="outlined" padding="lg" class="err-account">
        <span class="err-account-icon" aria-hidden="true"><LockKeyhole :size="18" /></span>
        <span class="err-account-meta">
          <DzText size="sm" tone="muted" as="span">Signed in as</DzText>
          <DzText weight="medium" as="span">{{ ACCOUNT }}</DzText>
        </span>
        <DzButton variant="text" tone="neutral" size="sm" href="#" class="err-account-action">
          Sign out
        </DzButton>
      </DzCard>

      <DzText size="sm" tone="muted" as="p" class="err-foot">
        Think this is a mistake? <a class="err-link" href="#">Contact your admin</a>.
      </DzText>
    </div>
  </main>
</template>

<style scoped>
.err-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: clamp(24px, 5vw, 64px);
  background:
    radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--dz-warning) 10%, transparent), transparent 60%),
    var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
}

.err-wrap {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
  margin-bottom: 8px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-warning);
  color: var(--dz-warning-foreground, #fff);
}

.err-code {
  margin: 0;
  font-size: clamp(5rem, 18vw, 8rem);
  font-weight: var(--dz-font-bold);
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(
    135deg,
    var(--dz-warning),
    color-mix(in oklch, var(--dz-warning) 55%, var(--dz-foreground))
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.err-alert {
  width: 100%;
  margin-top: 20px;
  text-align: left;
}

.err-account {
  width: 100%;
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
}

.err-account-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: var(--dz-radius-md);
  background: color-mix(in oklch, var(--dz-warning) 12%, transparent);
  color: var(--dz-warning);
}

.err-account-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.err-account-action {
  margin-left: auto;
  flex: none;
}

.err-foot {
  margin-top: 18px;
}

.err-link {
  color: var(--dz-warning);
  font-weight: var(--dz-font-medium);
  text-decoration: none;
}

.err-link:hover {
  text-decoration: underline;
}

.err-link:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: 2px;
  border-radius: var(--dz-radius-sm);
}
</style>
