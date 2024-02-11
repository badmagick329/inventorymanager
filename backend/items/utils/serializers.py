def stringify_error(e):
    error_dict = dict()
    for key, value in e.detail.items():
        error_dict[key] = str(value[0])
    return error_dict
