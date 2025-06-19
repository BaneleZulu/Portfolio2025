<?php

function __returnTimelineInformation($pdo)
{
    $timelineQuery = "SELECT * FROM timeline";
    $timelineResult = $pdo->prepare($timelineQuery);
    $timelineResult->execute();
    return $timelineResult->fetchAll(PDO::FETCH_ASSOC);
}
