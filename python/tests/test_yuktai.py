import json
import re

import pytest

import yuktai


def config_of(html):
    m = re.search(r"window\.YUKTAI_CONFIG=(\{.*?\});</script>", html)
    return json.loads(m.group(1)) if m else None


def test_default_tag_loads_pinned_version():
    html = yuktai.script_tag()
    assert 'src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@5.3.10/vanilla/index.min.js"' in html
    assert " defer" in html and "YUKTAI_CONFIG" not in html
    assert hasattr(html, "__html__")


def test_options_become_config():
    html = yuktai.script_tag(position="right", primary_color="#0a4a85", show_page_tools=True,
                             default_tab="ask", voice_lang="te-IN", auto_fix=False, show_skip_links=False)
    assert config_of(html) == {
        "position": "right", "primaryColor": "#0a4a85", "showPageTools": True, "defaultTab": "ask",
        "voiceLang": "te-IN", "config": {"autoFix": False, "showSkipLinks": False},
    }


def test_telugu_title_kept():
    assert config_of(yuktai.script_tag(title="సౌలభ్యం"))["title"] == "సౌలభ్యం"


def test_config_cannot_break_out_of_script():
    html = yuktai.script_tag(title='</script><script>alert(1)</script><!--')
    assert html.count("</script>") == 2  # only our own two tags
    assert "<script>alert" not in html and "<!--" not in html
    assert config_of(html)["title"] == '</script><script>alert(1)</script><!--'


@pytest.mark.parametrize("kw", [
    {"position": "top"}, {"primary_color": "red"}, {"default_tab": "x"},
    {"version": "5.3.10\" onload=\"x"}, {"cdn": "evil"}, {"nonce": 'a" onload="x'},
])
def test_bad_values_rejected(kw):
    with pytest.raises(ValueError):
        yuktai.script_tag(**kw)


def test_versions_and_cdns():
    assert yuktai.cdn_url("5") == "https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@5/vanilla/index.min.js"
    assert yuktai.cdn_url("latest") == "https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai/vanilla/index.min.js"
    assert yuktai.cdn_url("5.3.10", "unpkg").startswith("https://unpkg.com/@yuktishaalaa/yuktai@5.3.10/")


def test_nonce():
    html = yuktai.script_tag(show_page_tools=True, nonce="abc123")
    assert html.count('nonce="abc123"') == 2


def test_jinja_flask_fastapi():
    jinja2 = pytest.importorskip("jinja2")
    env = jinja2.Environment(autoescape=True)
    yuktai.init_jinja(env, position="right")
    out = env.from_string("<body>{{ yuktai_script(show_page_tools=True) }}</body>").render()
    assert "<script src=" in out and "&lt;script" not in out  # not double-escaped
    assert config_of(out) == {"position": "right", "showPageTools": True}


def test_django_tag():
    pytest.importorskip("django")
    import django
    from django.conf import settings

    if not settings.configured:
        settings.configure(
            INSTALLED_APPS=["yuktai"],
            TEMPLATES=[{"BACKEND": "django.template.backends.django.DjangoTemplates", "APP_DIRS": True}],
            YUKTAI={"position": "right"},
        )
        django.setup()
    from django.template import engines

    tpl = engines["django"].from_string("{% load yuktai_tags %}<body>{% yuktai_script show_page_tools=True %}</body>")
    out = tpl.render({})
    assert "<script src=" in out and "&lt;script" not in out
    assert config_of(out) == {"position": "right", "showPageTools": True}
