from prometheus_client import Counter, Histogram


page_views_by_user = Counter(
    'portal_page_views_by_user_total',
    'Total page views by user',
    ['user']
)

bounces = Counter(
    'portal_bounces_total',
    'Total visits shorter than 15 seconds'
)

session_depth = Histogram(
    'portal_session_depth_pages',
    'Page views per session',
    buckets=[1, 2, 3, 5, 8, 13, 21, float("inf")]
)