import datetime
from django.test import TestCase
from api.models import CustomUser, Entry


class UserCrudTestCase(TestCase):
    fixtures = ['api_views_testdata.json']

    def test_index(self):
        resp = self.client.get('/api/entry/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue('latest_poll_list' in resp.context)
        self.assertEqual([poll.pk for poll in resp.context['latest_poll_list']], [1])