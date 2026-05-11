#!/usr/bin/env python3
"""Autonomous launch pipeline — runs as one-shot background job.

Steps (each idempotent, retryable):
  1. Poll Google DNS until all 4 Resend records visible (max 30 min)
  2. Trigger Resend domain verification
  3. Poll Resend domain status until "verified" (max 60 min)
  4. Send the Lemon Squeezy application reply email via verified sender
  5. Log to /app/logs/launch_pipeline.log

Triggered manually:
  CF_TOKEN=... RESEND_KEY=... nohup python3 launch_pipeline.py &
"""
import os, sys, time, json, datetime, traceback
import urllib.request, urllib.error

# ---- Config ----
RESEND_KEY  = os.environ.get('RESEND_KEY') or os.environ.get('RESEND_API_KEY')
DOMAIN_ID   = '35aa1a99-0b0c-42b7-a79d-45613b332fbf'
LEMON_TO    = 'hello@lemonsqueezy.com'
LEMON_RE    = 'Tanushree'   # for greeting
SENDER      = 'Anna (Aurin) <support@prulesoul.site>'
REPLY_TO    = 'contact.puresoul@proton.me'
LOG_PATH    = '/app/logs/launch_pipeline.log'

DNS_RECORDS_TO_VERIFY = [
    ('TXT', 'prulesoul.site',                    'amazonses.com'),
    ('TXT', 'resend._domainkey.prulesoul.site',  'MIGfMA0G'),
    ('MX',  'send.prulesoul.site',               'feedback-smtp.eu-west-1'),
    ('TXT', 'send.prulesoul.site',               'include:amazonses.com'),
]

os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)


def log(msg):
    line = f'[{datetime.datetime.now().isoformat(timespec="seconds")}] {msg}'
    print(line, flush=True)
    with open(LOG_PATH, 'a') as f:
        f.write(line + '\n')


def http(method, url, headers=None, body=None, timeout=15):
    h = {'Content-Type': 'application/json'}
    if headers:
        h.update(headers)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, method=method, headers=h, data=data)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read().decode() or 'null')
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode() or 'null')
        except Exception:
            return e.code, None


# ---- Step 1: poll DNS ----
def poll_dns_until_propagated(max_minutes=30):
    log('STEP 1: polling Google DNS until 4/4 Resend records visible...')
    deadline = time.time() + max_minutes * 60
    while time.time() < deadline:
        good = 0
        statuses = []
        for typ, name, expect in DNS_RECORDS_TO_VERIFY:
            url = f'https://dns.google/resolve?name={name}&type={typ}'
            try:
                _, d = http('GET', url, timeout=8)
                ans = (d or {}).get('Answer') or []
                found = any(expect in (a.get('data') or '') for a in ans)
            except Exception:
                found = False
            if found:
                good += 1
            statuses.append(f'{typ}:{name.split(".")[0] or "@"}={"OK" if found else "..."}')
        log(f'  DNS check: {good}/4 - ' + ' '.join(statuses))
        if good == 4:
            log('  ✓ All 4 records propagated.')
            return True
        time.sleep(60)
    log('  ✗ Timeout waiting for DNS.')
    return False


# ---- Step 2-3: Resend verify + poll ----
def trigger_resend_verify():
    log('STEP 2: triggering Resend domain verify...')
    code, body = http(
        'POST',
        f'https://api.resend.com/domains/{DOMAIN_ID}/verify',
        headers={'Authorization': f'Bearer {RESEND_KEY}'},
    )
    log(f'  verify trigger: HTTP {code} → {body}')
    return code in (200, 201, 202)


def poll_resend_until_verified(max_minutes=60):
    log('STEP 3: polling Resend domain status until verified...')
    deadline = time.time() + max_minutes * 60
    triggered_again = False
    while time.time() < deadline:
        code, body = http(
            'GET',
            f'https://api.resend.com/domains/{DOMAIN_ID}',
            headers={'Authorization': f'Bearer {RESEND_KEY}'},
        )
        status = (body or {}).get('status', 'unknown')
        log(f'  Resend status = {status}')
        if status == 'verified':
            log('  ✓ Resend domain verified.')
            return True
        if status in ('failed',) and not triggered_again:
            log('  ↻ Re-triggering verify after failure...')
            trigger_resend_verify()
            triggered_again = True
        time.sleep(120)
    log('  ✗ Timeout waiting for Resend verification.')
    return False


# ---- Step 4: send Lemon Squeezy reply ----
LEMON_HTML = """\
<p>Hi Tanushree,</p>

<p>Thank you for reviewing my application — happy to share the details below.</p>

<p><strong>1. Product sample &amp; live store</strong><br>
Public landing page: <a href="https://prulesoul.life">https://prulesoul.life</a><br>
Main platform (where the digital products live): <a href="https://prulesoul.site">https://prulesoul.site</a><br>
You can browse the catalogue at
<a href="https://prulesoul.site/library">/library</a> (free reading entries),
<a href="https://prulesoul.site/bookstore">/bookstore</a> (paid books) and
<a href="https://prulesoul.site/cabinet">/cabinet</a> (Clarity Release passes &amp; courses).
Every paid product is a digital download (PDF / structured email course / private
reflection-cabinet session). I am happy to provide a free review copy of any
title you would like to inspect — just let me know which one.</p>

<p><strong>2. Pricing plan (one-time payments, USD)</strong></p>

<p><em>Books &amp; PDFs (8 titles)</em></p>
<ul>
  <li>Beyond the Matrix — Volume I &nbsp;—&nbsp; <strong>$13</strong></li>
  <li>Beyond the Matrix — Volume II &nbsp;—&nbsp; <strong>$13</strong></li>
  <li>The Language of Angels &nbsp;—&nbsp; <strong>$10</strong></li>
  <li>You Don't Have to Dance to Another's Tune &nbsp;—&nbsp; <strong>$7</strong></li>
  <li>Angels' Tales (kids) &nbsp;—&nbsp; <strong>$5</strong></li>
  <li>Angels' Story (kids) &nbsp;—&nbsp; <strong>$5</strong></li>
  <li>Engels' Friends 2 (kids) &nbsp;—&nbsp; <strong>$5</strong></li>
  <li>The Night Angels' Embrace (kids) &nbsp;—&nbsp; <strong>$5</strong></li>
</ul>

<p><em>Clarity Release passes (private reflection cabinet)</em></p>
<ul>
  <li>30-Minute Release &nbsp;—&nbsp; <strong>$15</strong></li>
  <li>60-Minute Release &nbsp;—&nbsp; <strong>$30</strong></li>
  <li>Season Pass — 30 days of access &nbsp;—&nbsp; <strong>$70</strong></li>
</ul>

<p><em>Email courses (drip-delivered letters + audio)</em></p>
<ul>
  <li>Letting the old stories rest &nbsp;—&nbsp; <strong>$25</strong></li>
  <li>The language you forgot &nbsp;—&nbsp; <strong>$25</strong></li>
  <li>Seven quiet evenings with children (parents) &nbsp;—&nbsp; <strong>$20</strong></li>
  <li>The body knows first &nbsp;—&nbsp; <strong>$25</strong></li>
</ul>

<p>All prices are listed publicly on each product page. Refund &amp; delivery terms
are at <a href="https://prulesoul.site/legal/terms">/legal/terms</a>; the platform
also publishes a <a href="https://prulesoul.site/wanderers-agreement">Wanderer's
Agreement</a> that frames the work as a calm reading/reflection space, not a
medical or therapeutic service.</p>

<p><strong>3. Profiles for verification</strong></p>
<ul>
  <li>LinkedIn (founder, Anna Lipasina): <a href="https://www.linkedin.com/in/anna-lipasina-90802b3b9/">linkedin.com/in/anna-lipasina-90802b3b9</a></li>
  <li>Instagram (project): <a href="https://instagram.com/pruesoul.life">@pruesoul.life</a></li>
  <li>Facebook community: <a href="https://www.facebook.com/groups/4059152880969336">facebook.com/groups/4059152880969336</a></li>
</ul>

<p>Please let me know if anything else would help complete the review — I'm
keen to start accepting payments and would value any pointers from your team.</p>

<p>Warm regards,<br>
Anna (creative name: Aurin)<br>
Founder, Prue Soul Life / Matrix Aurin<br>
<a href="https://prulesoul.life">prulesoul.life</a> · <a href="https://prulesoul.site">prulesoul.site</a></p>
"""

LEMON_TEXT = """\
Hi Tanushree,

Thank you for reviewing my application — happy to share the details below.

1. Product sample & live store
- Public landing page: https://prulesoul.life
- Main platform (where the digital products live): https://prulesoul.site
- Browse:
    /library     (free reading entries)
    /bookstore   (paid books)
    /cabinet     (Clarity Release passes & courses)
  Every paid product is a digital download. Happy to provide a free review
  copy of any title — just let me know which one.

2. Pricing plan (one-time payments, USD)

Books & PDFs (8 titles):
  Beyond the Matrix — Volume I              $13
  Beyond the Matrix — Volume II             $13
  The Language of Angels                    $10
  You Don't Have to Dance to Another's Tune  $7
  Angels' Tales (kids)                       $5
  Angels' Story (kids)                       $5
  Engels' Friends 2 (kids)                   $5
  The Night Angels' Embrace (kids)           $5

Clarity Release passes (private reflection cabinet):
  30-Minute Release                         $15
  60-Minute Release                         $30
  Season Pass — 30 days                     $70

Email courses (drip-delivered letters + audio):
  Letting the old stories rest              $25
  The language you forgot                   $25
  Seven quiet evenings with children        $20
  The body knows first                      $25

All prices are listed on each product page. Refund & delivery terms:
https://prulesoul.site/legal/terms
The platform also publishes a Wanderer's Agreement that frames the work as
a calm reading/reflection space, not a medical or therapeutic service:
https://prulesoul.site/wanderers-agreement

3. Profiles for verification
- LinkedIn (founder, Anna Lipasina):
    https://www.linkedin.com/in/anna-lipasina-90802b3b9/
- Instagram (project): @pruesoul.life
    https://instagram.com/pruesoul.life
- Facebook community:
    https://www.facebook.com/groups/4059152880969336

Please let me know if anything else would help complete the review — I'm
keen to start accepting payments and would value any pointers from your team.

Warm regards,
Anna (creative name: Aurin)
Founder, Prue Soul Life / Matrix Aurin
prulesoul.life · prulesoul.site
"""


def send_lemon_email():
    log('STEP 4: sending Lemon Squeezy reply email...')
    payload = {
        'from': SENDER,
        'to': [LEMON_TO],
        'reply_to': REPLY_TO,
        'subject': 'Re: Application for Matrix Aurin / prulesoul.site — sample, pricing, profiles',
        'html': LEMON_HTML,
        'text': LEMON_TEXT,
    }
    code, body = http(
        'POST',
        'https://api.resend.com/emails',
        headers={'Authorization': f'Bearer {RESEND_KEY}'},
        body=payload,
    )
    log(f'  email send: HTTP {code} → {body}')
    return code in (200, 201, 202)


# ---- Main ----
def main():
    log('=== launch_pipeline START ===')
    if not RESEND_KEY:
        log('FATAL: RESEND_KEY not set'); sys.exit(2)

    if not poll_dns_until_propagated():
        log('Aborting — DNS did not propagate in time.')
        sys.exit(3)

    trigger_resend_verify()

    if not poll_resend_until_verified():
        log('Aborting — Resend did not verify in time.')
        sys.exit(4)

    if not send_lemon_email():
        log('✗ Lemon Squeezy email failed to send.')
        sys.exit(5)

    log('=== launch_pipeline COMPLETE ✅ Lemon Squeezy email delivered ===')


if __name__ == '__main__':
    try:
        main()
    except Exception:
        log('UNCAUGHT EXCEPTION:\n' + traceback.format_exc())
        sys.exit(99)
