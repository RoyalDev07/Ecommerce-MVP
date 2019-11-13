import graphene
import graphql_jwt

import api.schema
from api.schema import CreateUser 


class Query(api.schema.Query, graphene.ObjectType):
    
    # This class will inherit from multiple Queries
    # as we begin to add more apps to our project
    pass

class Mutation(graphene.ObjectType):
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    create_user = CreateUser.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)