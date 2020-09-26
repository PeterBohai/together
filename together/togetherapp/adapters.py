from allauth.account.adapter import DefaultAccountAdapter


class CustomUserAccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        """
        Saves a new `User` instance using information provided in the
        signup form.
        """
        data = request.data
        user = super().save_user(request, user, form, False)
        user.first_name = data.get('first_name', '')
        user.last_name = data.get('last_name', '')

        user.save()
        return user