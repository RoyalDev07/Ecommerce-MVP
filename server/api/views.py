from django.shortcuts import render
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
User = get_user_model()
from django.contrib.auth import authenticate
from django.views.decorators.http import require_http_methods
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import action
from rest_framework import viewsets
from datetime import date
from django.db.models import Sum
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from django.core.serializers import serialize
from django.core.serializers.json import DjangoJSONEncoder

from api.models import Entry
from api.serializer import EntrySerializer, UserSerializer


class LazyEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, YourCustomType):
            return str(obj)
        return super().default(obj)


class EntryFilter(filters.FilterSet):
    from_date = filters.DateFilter(field_name="date", lookup_expr='gte')
    to_date = filters.DateFilter(field_name="date", lookup_expr='lte')

    class Meta:
        model = Entry
        fields = ['from_date', 'to_date']


class EntryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    def get_queryset(self):
        queryset = Entry.objects.all()
        user_data = self.request.user
        if user_data.role == "user":
            queryset = queryset.filter(user=user_data.id)
        return queryset
                
    serializer_class = EntrySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = EntryFilter

    @action(detail=False)
    def weekly_report(self, request):
        queryset = self.get_queryset()
        
        weekNumber = request.GET.get('week_number', None)
        if weekNumber is None:
            weekNumber = date.today().isocalendar()[1]

        queryset = queryset.filter(date__week=weekNumber)
        print (queryset)

        report_data = queryset.aggregate(total_distance=Sum('distance'), total_time=Sum('time'))
        
        return JsonResponse(report_data)


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
# Create your views here.


class SignInView(APIView):
    """
    List all snippets, or create a new snippet.
    """
    def post(self, request, format=None):
        username = request.data.get('username', '')
        password = request.data.get('password', '')
        user = authenticate(username=username, password=password)

        print (user)

        if user is not None:
            return HttpResponse("<html>Sign In Success!</html>", status=200)
        else:
            return HttpResponse("<html>Sign In Failure!</html>", status=401)



class SignUpView(APIView):
    def post(self, request, format=None):

        username = request.POST['username']
        password = request.POST['password']
        role = request.POST['role']        

        user = User.objects.create_user(username=username, role=role)
        user.set_password(password)
        user.save()
        return HttpResponse("<html>SignUp Finished!</html>") 


class UserView(APIView):
    def get(self, request, format=None):

        user = UserSerializer(self.request.user)
        return JsonResponse({'user':user.data}) 


class UserId(APIView):
    def post(self, request, format=None):
        print ("User:", User)
        user = User.objects.filter(username=request.data['username'])
        if len(user) > 0 :
            user = user[0].id
        else :
            user = None
        return JsonResponse({'user':user}) 