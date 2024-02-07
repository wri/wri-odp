from prefect import task
from pandas import DataFrame


@task(retries=3, retry_delay_seconds=15)
def data_to_file(data: list, tmp_filepath: str, format: str):
    # TODO: convert to file
    df = DataFrame.from_records(data)

    if format == "CSV":
        df.to_csv(tmp_filepath)
    elif format == "XLSX":
        df.to_excel(tmp_filepath)
    elif format == "XML":
        df.to_xml(tmp_filepath)
    elif format == "JSON":
        df.to_json(tmp_filepath, orient="index")
    elif format == "TSV":
        df.to_csv(tmp_filepath, sep="\t")
    else:
        raise "Invalid format"
