def stringify_error(e):
    error_dict = dict()
    if hasattr(e, "detail"):
        for key, value in e.detail.items():
            error_dict[key] = str(value[0])
        return error_dict
    raise ValueError(
        "Stringify error did not receieve serializers.ValidatorError", e
    )
