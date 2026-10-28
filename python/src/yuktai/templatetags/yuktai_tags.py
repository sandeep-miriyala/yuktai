"""Django template tag.

settings.py:   INSTALLED_APPS = [..., "yuktai"]
template:      {% load yuktai_tags %} ... {% yuktai_script position="right" show_page_tools=True %}

Optional site-wide defaults in settings.py:
    YUKTAI = {"position": "right", "show_page_tools": True}
"""

from django import template
from django.conf import settings
from django.utils.safestring import mark_safe

from .. import script_tag

register = template.Library()


@register.simple_tag
def yuktai_script(**options):
    defaults = dict(getattr(settings, "YUKTAI", {}) or {})
    defaults.update(options)
    return mark_safe(str(script_tag(**defaults)))
